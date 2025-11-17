export async function postData(url,data){const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});return res.json();}
import ChatBox from './components/ChatBox';
// hoặc
import PhishingAIChatbot from './components/ChatBox';