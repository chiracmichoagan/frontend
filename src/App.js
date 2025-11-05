import { useState } from 'react';
import { Upload, Download, Trash2, Image as ImageIcon } from 'lucide-react';

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [processedUrl, setProcessedUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:5000/api';

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 sm:mb-3">
            Suppresseur d'Arrière-Plan
          </h1>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg">
            Téléchargez votre image et retirez l'arrière-plan en un clic
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
          {/* Zone de téléchargement */}
          <div className="mb-6 md:mb-8">
            <label className="flex flex-col items-center justify-center w-full h-48 sm:h-56 md:h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-500 transition-colors bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-3" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
                </p>
                <p className="text-xs text-gray-400">PNG, JPG, JPEG ou WEBP</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleFileSelect}
              />
            </label>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm sm:text-base">
              {error}
            </div>
          )}

          {/* Boutons */}
          {selectedFile && (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 justify-center items-center">
              <button
                onClick={handleRemoveBackground}
                disabled={loading}
                className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium w-full sm:w-auto"
              >
                <ImageIcon className="w-5 h-5" />
                {loading ? 'Traitement...' : 'Retirer l\'arrière-plan'}
              </button>

              {processedUrl && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium w-full sm:w-auto"
                >
                  <Download className="w-5 h-5" />
                  Télécharger
                </button>
              )}

              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium w-full sm:w-auto"
              >
                <Trash2 className="w-5 h-5" />
                Réinitialiser
              </button>
            </div>
          )}

          {/* Images */}
          {(previewUrl || processedUrl) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {previewUrl && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3 text-gray-700 text-center md:text-left">Image originale</h3>
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
                    <img
                      src={previewUrl}
                      alt="Original"
                      className="w-full max-w-full h-auto max-h-80 md:max-h-96 object-contain"
                    />
                  </div>
                </div>
              )}

              {processedUrl && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3 text-gray-700 text-center md:text-left">Sans arrière-plan</h3>
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
                      className="w-full max-w-full h-auto max-h-80 md:max-h-96 object-contain relative z-10"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
