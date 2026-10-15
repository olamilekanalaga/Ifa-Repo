// Fail-closed production boundary. Demo sessions, role flags and browser state
// are deliberately never consumed here. Connect a real auth/database adapter
// before implementing any private operations.
export default function workspaceApi(req,res){
 res.setHeader('Content-Type','application/json; charset=utf-8');
 res.setHeader('Cache-Control','no-store');
 res.setHeader('X-Content-Type-Options','nosniff');
 const pathname=new URL(req.url,'https://workspace.invalid').pathname.replace(/\/$/,'');
 if(req.method==='GET'&&pathname==='/api/workspace/session'){
  res.statusCode=200;res.end(JSON.stringify({mode:'production',authenticationConfigured:false,databaseConfigured:false,user:null,demoRoleSwitching:false}));return;
 }
 const registration=['/api/workspace/creator/register','/api/workspace/founder/applications','/api/workspace/auth/sign-in'];
 res.statusCode=registration.includes(pathname)?503:401;
 res.end(JSON.stringify({code:registration.includes(pathname)?'AUTHENTICATION_NOT_CONFIGURED':'UNAUTHENTICATED',message:'Production authentication and organisation-scoped storage are not connected. No private data or permissions are available.',demo:false}));
}
