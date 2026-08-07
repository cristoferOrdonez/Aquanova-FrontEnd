// src/components/Login/Index.jsx
import LoginImg from './../../assets/images/login-background.webp'
import SignInSection from './components/SignInSection'
import { useLoginForm } from './hooks/useLoginForm'


function Index() {

    const loginForm = useLoginForm();

    return (
        <div
            className="w-screen h-screen flex items-center justify-center font-work bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${LoginImg})` }}
        >
            <SignInSection {...loginForm} />
        </div>
    )
}

export default Index;
