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
                        const keycloakInstance = keycloak.getKeycloakInstance();

            const realmRoles = keycloakInstance.realmAccess?.roles || [];
            localStorage.setItem('realm_roles', JSON.stringify(realmRoles));
            console.log(realmRoles)

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

export function logout(keycloak: KeycloakService) {
  keycloak.logout().then(() => {
    localStorage.removeItem('access_token');
    console.log('Déconnexion réussie et token supprimé du localStorage ✅');
  }).catch((error) => {
    console.error('Erreur lors de la déconnexion Keycloak ❌', error);
  });
}
