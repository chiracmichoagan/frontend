import { useState } from 'react';
import { Upload, Download, Trash2, Sparkles, Settings } from 'lucide-react';

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [processedUrl, setProcessedUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  
  // Options avancées
  const [selectedModel, setSelectedModel] = useState('u2net');
  const [alphaMatting, setAlphaMatting] = useState(true);
  const [postProcess, setPostProcess] = useState(true);

  const API_URL = 'http://localhost:5000/api';

  const models = [
    { id: 'u2net', name: 'U2-Net (Recommandé)', desc: 'Équilibre vitesse/qualité' },
    { id: 'isnet', name: 'IS-Net (Haute qualité)', desc: 'Meilleure qualité, plus lent' },
    { id: 'human', name: 'U2-Net Human', desc: 'Optimisé pour les portraits' }
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setProcessedUrl(null);
      setError(null);
    }
  };

  const handleRemoveBackground = async () => {
    if (!selectedFile) {
      setError('Veuillez sélectionner une image');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('model', selectedModel);
    formData.append('alpha_matting', alphaMatting.toString());
    formData.append('post_process', postProcess.toString());

    try {
      const response = await fetch(`${API_URL}/remove-background-preview`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors du traitement de l\'image');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setProcessedUrl(url);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('model', selectedModel);
    formData.append('alpha_matting', alphaMatting.toString());
    formData.append('post_process', postProcess.toString());

    try {
      const response = await fetch(`${API_URL}/remove-background`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'image_sans_fond.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Erreur lors du téléchargement');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setProcessedUrl(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Suppresseur d'Arrière-Plan Pro
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            Suppression professionnelle d'arrière-plan avec IA avancée
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8">
          <div className="mb-6">
            <label className="flex flex-col items-center justify-center w-full h-48 md:h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-500 transition-colors bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mb-3" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
                </p>
                <p className="text-xs text-gray-400">PNG, JPG, JPEG ou WEBP (max 10MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleFileSelect}
              />
            </label>
          </div>

          {/* Paramètres avancés */}
          <div className="mb-6">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium mb-3"
            >
              <Settings className="w-5 h-5" />
              {showSettings ? 'Masquer' : 'Afficher'} les paramètres avancés
            </button>

            {showSettings && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modèle IA
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {models.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} - {model.desc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="alphaMatting"
                    checked={alphaMatting}
                    onChange={(e) => setAlphaMatting(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="alphaMatting" className="text-sm text-gray-700">
                    <span className="font-medium">Alpha Matting</span> - Améliore les bords et détails fins (recommandé)
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="postProcess"
                    checked={postProcess}
                    onChange={(e) => setPostProcess(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="postProcess" className="text-sm text-gray-700">
                    <span className="font-medium">Post-traitement</span> - Adoucit les bords pour un rendu plus naturel
                  </label>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {selectedFile && (
            <div className="flex flex-wrap gap-3 mb-6 justify-center">
              <button
                onClick={handleRemoveBackground}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-sm md:text-base"
              >
                <Sparkles className="w-5 h-5" />
                {loading ? 'Traitement en cours...' : 'Retirer l\'arrière-plan'}
              </button>
              
              {processedUrl && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm md:text-base"
                >
                  <Download className="w-5 h-5" />
                  Télécharger
                </button>
              )}
              
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm md:text-base"
              >
                <Trash2 className="w-5 h-5" />
                Réinitialiser
              </button>
            </div>
          )}

          {loading && (
            <div className="mb-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600"></div>
              <p className="mt-2 text-sm text-gray-600">
                Traitement en cours... Cela peut prendre quelques secondes
              </p>
            </div>
          )}

          {(previewUrl || processedUrl) && (
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              {previewUrl && (
                <div>
                  <h3 className="text-base md:text-lg font-semibold mb-3 text-gray-700">Image originale</h3>
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
                    <img
                      src={previewUrl}
                      alt="Original"
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                </div>
              )}

              {processedUrl && (
                <div>
                  <h3 className="text-base md:text-lg font-semibold mb-3 text-gray-700">Sans arrière-plan</h3>
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 relative">
                    <div 
                      className="absolute inset-0"
                      style={{
                        backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                      }}
                    />
                    <img
                      src={processedUrl}
                      alt="Traité"
                      className="w-full h-auto max-h-96 object-contain relative z-10"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 md:mt-8 bg-white rounded-lg p-4 md:p-6 shadow-md">
          <h3 className="font-semibold text-gray-800 mb-3 text-base md:text-lg">💡 Conseils pour de meilleurs résultats</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• <strong>IS-Net</strong> : Utilisez pour les détails fins (cheveux, fourrure)</li>
            <li>• <strong>U2-Net Human</strong> : Idéal pour les portraits et photos de personnes</li>
            <li>• <strong>Alpha Matting</strong> : Active toujours cette option pour des bords nets</li>
            <li>• <strong>Qualité image</strong> : Utilisez des images haute résolution pour de meilleurs résultats</li>
            <li>• <strong>Format</strong> : L'image finale est en PNG avec fond transparent</li>
          </ul>
        </div>
      </div>
    </div>
  );
}