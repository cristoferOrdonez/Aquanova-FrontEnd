// src/components/Login/Index.jsx
import LoginImg from './../../assets/images/image_login.png'
import SignInSection from './components/SignInSection'
import { useLoginForm } from './hooks/useLoginForm'


function Index() {

    const loginForm = useLoginForm();
    
    return (
        <div className="w-screen h-screen flex flex-row font-work">
            <div className="w-[50%] h-screen">
                <img src={LoginImg} className = "w-full h-screen object-cover object-center"/>
            </div>
            <div className="w-[50%] h-screen">
                <SignInSection {...loginForm} />
            </div>
        </div>
    )
}

export default Index;