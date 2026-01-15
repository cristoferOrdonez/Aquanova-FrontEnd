import NeighborhoodCard from './NeighborhoodCard'
import { PlusIcon } from '@heroicons/react/24/outline'
import SearchBar from '../SearchBar'
import { useNavigate } from 'react-router-dom'

function NeighborhoodList() {
  const navigate = useNavigate()

  return (
    <div className="p-4 m-7">
      <div className="flex flex-row flex-1 justify-end">

        <button
          type="button"
          onClick={() => navigate('/neighborhood_creation')}
          className="flex flex-row gap-3 whitespace-nowrap bg-(--blue-buttons) rounded-4xl font-work text-white justify-center items-center p-3"
        >
          <PlusIcon className="h-10 w-10" />
          Nuevo barrio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 mt-5">
        <NeighborhoodCard />
        <NeighborhoodCard />
        <NeighborhoodCard />
        <NeighborhoodCard />
        <NeighborhoodCard />
        <NeighborhoodCard />
      </div>
    </div>
  )
}

export default NeighborhoodList
