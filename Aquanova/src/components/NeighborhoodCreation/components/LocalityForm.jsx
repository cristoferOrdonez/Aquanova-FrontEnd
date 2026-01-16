import CommonField from "./CommonField";
import SaveButton from "./SaveButton";

function LocalityForm() {
    return (
        <div className="w-full flex justify-center items-start animate-fade-in-up">
            <div className="
                w-full max-w-lg 
                p-8 
                flex flex-col gap-6 
                bg-gray-800/30
                border border-white/5 
                rounded-2xl 
            ">
                <div className="text-center mb-1">
                    <h3 className="text-lg font-bold text-white">Registro de la localidad</h3>
                    <p className="text-xs text-gray-500 mt-1">Ingrese los datos básicos</p>
                </div>

                <div className="flex flex-col gap-4">
                    <CommonField 
                        label="Código"
                        placeholder="Ej. 001"
                    />
                    <CommonField
                        label="Nombre"
                        placeholder="Ej. Usaquén"
                    />
                </div>
                
                <SaveButton />
            </div>
        </div>
    );
}

export default LocalityForm;