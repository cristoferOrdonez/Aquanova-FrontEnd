import CommonSelector from "../../ui/CommonSelector";
import CommonField from "./../../ui/CommonField";
import { useState } from "react";

function NeighborhoodForm() {

    const optionsParent = [
        "Opción 1",
        "Opción 2",
        "Opción 3",
    ];

    const [selectedParentOption, setSelectedParentOption] = useState("Seleccione una opción");

    return (
        <div className="w-full h-full flex flex-col justify-center items-center">
            <div className="w-full h-wrap flex flex-col gap-6 p-6 bg-[var(--card-bg)] border border-[1.5px] border-[var(--card-stroke)] rounded-[5px]">
                <div className="w-full h-wrap flex flex-col gap-6 text-center">
                    <CommonField 
                        label="Codigo:"
                        placeholder="Digite el código del barrio"
                    />
                    <CommonField
                        label="Nombre:"
                        placeholder="Digite el nombre del barrio"
                    />
                </div>
                <div className="w-full h-wrap flex flex-col">
                    <span className="text-sm font-semibold text-center">
                        Seleccione la localidad o barrio al cual pertenece:
                    </span>
                    <CommonSelector
                        options={optionsParent}
                        selectedOption={selectedParentOption} setSelectedOption={setSelectedParentOption}
                        widthSelector="full"
                        scaleOptions={100}
                        translateX={0}
                    />
                </div>
            </div>
        </div>
    );
}

export default NeighborhoodForm;