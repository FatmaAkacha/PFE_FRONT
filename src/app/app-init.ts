import { KeycloakService } from 'keycloak-angular';

export function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak
      .init({
        config: {
          url: 'http://localhost:8080/auth', // URL du serveur Keycloak
          realm: 'DuxWeb', 
          clientId: 'asm',
        },
        initOptions: {
          onLoad: 'login-required', // L'utilisateur doit être connecté
          checkLoginIframe: false,
        },
        enableBearerInterceptor: true, // Ajoute automatiquement le token aux requêtes HTTP
      })
      .then(() => {
        // Récupération et stockage du token après initialisation réussie
        return keycloak.getToken().then((token) => {
          if (token) {
            localStorage.setItem('access_token', token);
            console.log('Token Keycloak stocké dans le localStorage ✅');
          } else {
            console.warn('⚠️ Aucun token récupéré !');
          }
        });
      })
      .catch((error) => {
        console.error('Erreur lors de l\'initialisation de Keycloak ❌', error);
      });
}
