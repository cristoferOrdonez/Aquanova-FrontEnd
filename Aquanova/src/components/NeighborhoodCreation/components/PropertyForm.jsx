import CommonSelector from "./CommonSelector";
import CommonField from "./CommonField";
import SaveButton from "./SaveButton";
import { useState } from "react";

function PropertyForm() {
    const optionsParent = ["Localidad 1", "Localidad 2", "Localidad 3"];
    const [selectedParentOption, setSelectedParentOption] = useState("Seleccione una opción");

    return (
        <div className="w-full flex justify-center items-start animate-fade-in-up">
            <div className="w-full max-w-lg p-8 flex flex-col gap-6 bg-gray-800/30 border border-white/5 rounded-2xl">
                <div className="text-center mb-1">
                    <h3 className="text-lg font-bold text-white">Registro del predio</h3>
                    <p className="text-xs text-gray-500 mt-1">Detalles y ubicación</p>
                </div>

                <div className="flex flex-col gap-4">
                    <CommonField label="Código" placeholder="Ej. B-205" />
                    <CommonField label="Nombre" placeholder="Ej. Santa Bárbara" />
                    
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pertenece a</label>
                        <CommonSelector
                            options={optionsParent}
                            selectedOption={selectedParentOption} 
                            setSelectedOption={setSelectedParentOption}
                        />
                    </div>
                </div>

                <SaveButton />
            </div>
        </div>
    );
}

export default PropertyForm;