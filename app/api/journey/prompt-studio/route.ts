import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI, Type, type Part } from '@google/genai';
export const maxDuration=300;
type Step={id:string;name:string;prompt_template:string;temperature:number;output_kind:'text'|'energy_map'|'image';model_key:string};
type Trace={name:string;prompt:string;model:string;duration_ms:number;output?:string;error?:string};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function imageKind(bytes:Uint8Array){if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return'image/jpeg';if([137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n))return'image/png';if(Buffer.from(bytes.subarray(0,4)).toString()==='RIFF'&&Buffer.from(bytes.subarray(8,12)).toString()==='WEBP')return'image/webp';return null}
function publicError(message:string){if(/429|quota|RESOURCE_EXHAUSTED/i.test(message))return 'The selected model reached its quota or rate limit. Check Google AI Studio usage or try another model.';if(/403|401|API_KEY|permission.denied/i.test(message))return 'Google rejected this model or its credentials. Check its availability in Google AI Studio.';if(/404|not found|not supported/i.test(message))return 'The selected model is unavailable. Choose an available model in the step editor.';if(/timeout|abort|503|overload|unavailable/i.test(message))return 'The model timed out or is temporarily unavailable. Please try again.';return message.slice(0,1000)}
export async function POST(req:Request){
 const apiKey=process.env.GEMINI_API_KEY;const url=process.env.NEXT_PUBLIC_ALBUM_JOURNEYS_SUPABASE_URL;const key=process.env.NEXT_PUBLIC_ALBUM_JOURNEYS_SUPABASE_KEY;
 if(!url||!key||!apiKey)return NextResponse.json({error:'The generation service is not configured.'},{status:503});
 const token=req.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];if(!token)return NextResponse.json({error:'Sign in to generate media.'},{status:401});
 const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:`Bearer ${token}`}}});
 const{data:{user},error:authError}=await db.auth.getUser(token);if(authError||!user)return NextResponse.json({error:'Your session expired. Sign in again.'},{status:401});
 const{data:profile,error:profileError}=await db.from('profiles').select('is_superadmin').eq('id',user.id).maybeSingle();
 if(profileError||profile?.is_superadmin!==true||!(user.identities??[]).some(i=>i.provider==='google'))return NextResponse.json({error:'Superadmin access required.'},{status:403});
 let body:Record<string,unknown>;try{const text=await req.text();if(text.length>3000000)return NextResponse.json({error:'Input image exceeds 2 MB.'},{status:413});body=JSON.parse(text)}catch{return NextResponse.json({error:'Invalid JSON request.'},{status:400})}
 const input=typeof body.input==='string'?body.input.trim():'';
 if(typeof body.chain_id!=='string'||!uuid.test(body.chain_id)||typeof body.request_id!=='string'||!uuid.test(body.request_id)||!Number.isInteger(body.revision)||!input||input.length>4000)return NextResponse.json({error:'Choose a saved chain and supply an input of 1–4,000 characters.'},{status:400});
 let initialImage:Part|undefined;
 if(body.image){const image=body.image as {data?:unknown;mime_type?:unknown};if(typeof image.data!=='string'||image.data.length>2800000||!/^[A-Za-z0-9+/]*={0,2}$/.test(image.data))return NextResponse.json({error:'Invalid image.'},{status:400});const bytes=Buffer.from(image.data,'base64');const kind=imageKind(bytes);if(bytes.length>2097152||!kind||image.mime_type!==kind)return NextResponse.json({error:'Choose a valid PNG, JPG, or WebP under 2 MB.'},{status:400});initialImage={inlineData:{data:image.data,mimeType:kind}}}
 const{data:config,error:beginError}=await db.rpc('greenhouse_begin_run',{p_chain:body.chain_id,p_revision:body.revision,p_request:body.request_id,p_input:input,p_has_image:!!initialImage});
 if(beginError)return NextResponse.json({error:publicError(beginError.message)},{status:/20 runs|already running/.test(beginError.message)?429:409});
 const id=config.id as string;const steps=config.steps as Step[];const trace:Trace[]=[];const ai=new GoogleGenAI({apiKey});let previous='';let output:Record<string,unknown>={};const startedAll=Date.now();
 try{
 for(let i=0;i<steps.length;i++){
 if(Date.now()-startedAll>230000)throw new Error('Generation timeout. Try a shorter chain.');
 const step=steps[i];const rendered=step.prompt_template.replaceAll('{{input}}',input).replaceAll('{{description}}',input).replaceAll('{{minutes}}','30').replaceAll('{{previous}}',previous)+(previous&&!step.prompt_template.includes('{{previous}}')?'\nPrevious step output:\n'+previous:'');
 const prompt=rendered+'\n\nOriginal input:\n'+input;const contents:Part[]=[{text:prompt}];if(i===0&&initialImage)contents.push(initialImage);
 const started=Date.now();const record:Trace={name:step.name,prompt,model:step.model_key,duration_ms:0};
 try{
 if(step.output_kind==='image'&&i!==steps.length-1)throw new Error('Image generation must be the final step.');
 const response=await ai.models.generateContent({model:step.model_key,contents:[{role:'user',parts:contents}],config:{temperature:Number(step.temperature),httpOptions:{timeout:45000},...(step.output_kind==='image'?{responseModalities:['TEXT','IMAGE']}:step.output_kind==='energy_map'?{responseMimeType:'application/json',responseSchema:{type:Type.OBJECT,properties:{title:{type:Type.STRING},description:{type:Type.STRING},energy:{type:Type.ARRAY,items:{type:Type.INTEGER,minimum:0,maximum:100},minItems:10,maxItems:10}},required:['title','description','energy']}}:{maxOutputTokens:4096})}});
 const parts=response.candidates?.[0]?.content?.parts??[];const text=parts.map(p=>p.text??'').join('').trim();
 if(step.output_kind==='image'){
 const image=parts.find(p=>p.inlineData?.data&&p.inlineData.mimeType?.startsWith('image/'))?.inlineData;
 if(!image?.data)throw new Error('The model returned no image. Use an image-generation model and check its quota.');
 const bytes=Buffer.from(image.data,'base64');const kind=imageKind(bytes);if(!kind||bytes.length>10485760)throw new Error('The model returned an unsupported image.');
 const path=`${user.id}/${id}.${kind==='image/png'?'png':kind==='image/jpeg'?'jpg':'webp'}`;
 const{error}=await db.storage.from('greenhouse-media').upload(path,bytes,{contentType:kind,upsert:false});if(error)throw new Error('Generated image could not be saved.');
 output={text,image_path:path};previous=text||'[Generated image]';record.output=text||'[Generated image saved]';
 }else if(step.output_kind==='energy_map'){
 const value=JSON.parse(text.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,''));
 if(!value||typeof value.title!=='string'||!value.title.trim()||value.title.length>120||typeof value.description!=='string'||value.description.length>1000||!Array.isArray(value.energy)||value.energy.length!==10||!value.energy.every((n:unknown)=>typeof n==='number'&&Number.isInteger(n)&&n>=0&&n<=100))throw new Error('The model returned an invalid energy map. Try again or adjust this step.');
 output={title:value.title,description:value.description,energy:value.energy};previous=JSON.stringify(output);record.output=previous;
 }else{if(!text)throw new Error('The model returned no text. Adjust the prompt or try again.');previous=text;record.output=text;output={text}}
 }catch(e){record.error=publicError(e instanceof Error?e.message:'Model request failed.');throw new Error(record.error)}finally{record.duration_ms=Date.now()-started;trace.push(record);const{error}=await db.from('greenhouse_runs').update({steps:trace}).eq('id',id).eq('user_id',user.id);if(error)throw new Error('Could not save the step trace. Generation stopped.');}
 }
 const{error}=await db.from('greenhouse_runs').update({status:'succeeded',steps:trace,output,completed_at:new Date().toISOString()}).eq('id',id).eq('user_id',user.id);if(error)throw new Error('Could not save the completed generation.');
 return NextResponse.json({id,status:'succeeded'},{headers:{'Cache-Control':'private, no-store'}});
 }catch(e){const message=publicError(e instanceof Error?e.message:'Generation failed.');await db.from('greenhouse_runs').update({status:'failed',steps:trace,error:message,completed_at:new Date().toISOString()}).eq('id',id).eq('user_id',user.id);return NextResponse.json({id,error:message},{status:502})}
}
