import CommonField from "./../../ui/CommonField";

function LocalityForm() {
    return (
        <div className="w-full h-full flex flex-col justify-center items-center">
            <div className="w-full h-wrap flex flex-col gap-6 p-6 bg-[var(--card-bg)] border border-[1.5px] border-[var(--card-stroke)] rounded-[5px]">
                <div className="w-full h-wrap flex flex-col gap-6 text-center">
                    <CommonField 
                        label="Codigo:"
                        placeholder="Digite el código del la localidad"
                    />
                    <CommonField
                        label="Nombre:"
                        placeholder="Digite el nombre de la localidad"
                    />
                </div>
            </div>
        </div>
    );
}

export default LocalityForm;