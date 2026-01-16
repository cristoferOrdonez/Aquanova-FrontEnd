import FormCard from "./components/FormCard"
import { PlusIcon } from "@heroicons/react/24/outline"
import SearchBar from "../ui/SearchBar"
import { useNavigate } from 'react-router-dom'

function FormList(){
  const navigate = useNavigate()
  return(
    <div className="p-4 m-7">
      <div className="flex flex-row flex-1">
        <div className="flex w-full gap-5">
          <SearchBar/>
          <SearchBar/>
        </div>

        <button
          type="button"
          onClick={() => navigate('/form_creation')}
          className="flex flex-row gap-3 whitespace-nowrap bg-[var(--blue-buttons)] rounded-4xl font-work text-white justify-center items-center p-3"
        >
          <PlusIcon className="h-10 w-10"/>
          Nueva campaña
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 mt-5">
        <FormCard/>
        <FormCard/>
        <FormCard/>
        <FormCard/>
        <FormCard/>
        <FormCard/>
      </div>
    </div>
    
  )
}

export default FormList