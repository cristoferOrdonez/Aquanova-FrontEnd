import CommonField from "./CommonField";
import SaveButton from "./SaveButton";
import { useGeoLevelSelectionContext, useImageGalleryContext } from '../hooks/useGeoLevelCreationContext.js';

function LocalityForm() {
    const {
        formCode,
        setFormCode,
        formName,
        setFormName,
        formDescription,
        setFormDescription,
        isSubmitting,
        createGeoLevel,
    } = useGeoLevelSelectionContext();

    const { buildMetadata } = useImageGalleryContext();

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
                        onInput={(e) => setFormCode(e.target.value)}
                        value={formCode}
                    />
                    <CommonField
                        label="Nombre"
                        placeholder="Ej. Usaquén"
                        onInput={(e) => setFormName(e.target.value)}
                        value={formName}
                    />
                    <CommonField
                        label="Descripción"
                        placeholder="Descripción breve"
                        onInput={(e) => setFormDescription(e.target.value)}
                        value={formDescription}
                        multiline={true}
                        fixedHeightClass="h-28"
                    />
                </div>
                
                <SaveButton
                    onClick={async () => {
                        const metadata = buildMetadata();
                        try {
                            const res = await createGeoLevel({ metadata });
                            const msg = res?.message || 'Localidad creada exitosamente';
                            alert(msg);
                        } catch (err) {
                            alert(err?.message || err?.data?.message || 'Error al crear la localidad');
                        }
                    }}
                    disabled={isSubmitting}
                />
            </div>
        </div>
    );
}

export default LocalityForm;