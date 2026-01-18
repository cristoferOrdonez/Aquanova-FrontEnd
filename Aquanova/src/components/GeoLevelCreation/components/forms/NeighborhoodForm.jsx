import CommonSelector from "./CommonSelector";
import CommonField from "./CommonField";
import SaveButton from "./SaveButton";
import { useGeoLevelSelectionContext, useImageGalleryContext } from '../hooks/useGeoLevelCreationContext.js';

/**
 * Componente NeighborhoodForm - Formulario de registro de barrio
 * Consume el contexto directamente
 */
function NeighborhoodForm() {
    const {
        parentLocalityOptions,
        selectedParentLocalityOption,
        setSelectedParentLocalityOption,
        isGeoLevelParentSelectorOpen,
        setIsGeoLevelParentSelectorOpen,
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
            <div className="w-full max-w-lg p-8 flex flex-col gap-6 bg-gray-800/30 border border-white/5 rounded-2xl">
                <div className="text-center mb-1">
                    <h3 className="text-lg font-bold text-white">Registro del barrio</h3>
                    <p className="text-xs text-gray-500 mt-1">Detalles y ubicación</p>
                </div>

                <div className="flex flex-col gap-4">
                    <CommonField label="Código" placeholder="Ej. B-205" onInput={(e) => setFormCode(e.target.value)} value={formCode} />
                    <CommonField label="Nombre" placeholder="Ej. Santa Bárbara" onInput={(e) => setFormName(e.target.value)} value={formName} />
                    <CommonField label="Descripción" placeholder="Descripción breve" onInput={(e) => setFormDescription(e.target.value)} value={formDescription} multiline={true} fixedHeightClass="h-28" />
                    
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pertenece a</label>
                        <CommonSelector
                            options={parentLocalityOptions}
                            selectedOption={selectedParentLocalityOption} setSelectedOption={setSelectedParentLocalityOption}
                            isGeoLevelParentSelectorOpen={isGeoLevelParentSelectorOpen} setIsGeoLevelParentSelectorOpen={setIsGeoLevelParentSelectorOpen}
                        />
                    </div>
                </div>

                <SaveButton
                    onClick={async () => {
                        const metadata = buildMetadata();
                        const parent_id = selectedParentLocalityOption?.id ?? null;
                        try {
                            const res = await createGeoLevel({ parent_id, metadata });
                            const msg = res?.message || 'Barrio creado exitosamente';
                            alert(msg);
                        } catch (err) {
                            alert(err?.message || err?.data?.message || 'Error al crear el barrio');
                        }
                    }}
                    disabled={isSubmitting}
                />
            </div>
        </div>
    );
}

export default NeighborhoodForm;