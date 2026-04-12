// src/components/Login/Index.jsx
import LoginImg from './../../assets/images/image_login.png'
import SignInSection from './components/SignInSection'
import { useLoginForm } from './hooks/useLoginForm'


function Index() {

    const loginForm = useLoginForm();
    
    return (
        <div className="w-screen h-screen flex flex-col md:flex-row font-work">
            <div className="w-full h-[30vh] md:w-[50%] md:h-screen">
                <img src={LoginImg} className="w-full h-full object-cover object-center"/>
            </div>
            <div className="w-full h-[70vh] md:w-[50%] md:h-screen overflow-y-auto">
                <SignInSection {...loginForm} />
            </div>
        </div>
    )
}

export default Index;