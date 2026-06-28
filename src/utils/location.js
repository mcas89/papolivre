/**
 * Solicita a localização do usuário via API do navegador.
 * Arredonda as coordenadas para 1 casa decimal (~11km a 15km de precisão)
 * para garantir a privacidade (nunca exata, apenas raio aproximado).
 * 
 * @returns {Promise<{lat: number, lng: number}>}
 */
export function requestApproximateLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Seu navegador não suporta geolocalização."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Arredondar para 1 casa decimal para privacidade (~20km radius)
        const latitude = Math.round(position.coords.latitude * 10) / 10;
        const longitude = Math.round(position.coords.longitude * 10) / 10;
        
        resolve({ latitude, longitude });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new Error("A localização é obrigatória para conectar você a pessoas próximas. Permita o acesso no seu navegador."));
        } else {
          reject(new Error("Não foi possível obter sua localização. Verifique o GPS ou as permissões do navegador."));
        }
      },
      {
        enableHighAccuracy: false, // não precisamos de precisão exata
        timeout: 10000,
        maximumAge: 60000, // pode usar cache de 1 minuto
      }
    );
  });
}
