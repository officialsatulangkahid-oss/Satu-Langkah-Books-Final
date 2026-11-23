import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProgress } from "../useProgress";
import { Button } from "@/components/ui/button";
export default function RequireLearner({children}:{children:React.ReactNode}) {
 const {user,loading}=useAuth();const location=useLocation();const {ready,error,retry}=useProgress();
 if(loading)return <p className="p-12 text-center">Memuat akun…</p>;
 if(!user)return <Navigate to={'/learn/auth?next='+encodeURIComponent(location.pathname+location.search)} replace/>;
 if(!ready)return <div className="mx-auto max-w-lg space-y-4 p-12 text-center"><p>{error||'Memuat progres belajar…'}</p>{error&&<Button onClick={retry}>Coba lagi</Button>}</div>;
 return children;
}
