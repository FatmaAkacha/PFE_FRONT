import { Component, OnInit } from '@angular/core';
import { AppMainComponent } from './app.main.component';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[];

    constructor(public appMain: AppMainComponent) { }

    ngOnInit() {
        this.model = [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] },
            {
                label: 'UI Kit', icon: 'pi pi-fw pi-star-fill', routerLink: ['/uikit'],
                items: [
                    { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', routerLink: ['/uikit/formlayout'] },
                    { label: 'Input', icon: 'pi pi-fw pi-check-square', routerLink: ['/uikit/input'] },
                    { label: 'Float Label', icon: 'pi pi-fw pi-bookmark', routerLink: ['/uikit/floatlabel'] },
                    { label: 'Invalid State', icon: 'pi pi-fw pi-exclamation-circle', routerLink: ['/uikit/invalidstate'] },
                    { label: 'Button', icon: 'pi pi-fw pi-mobile', routerLink: ['/uikit/button'], class: 'rotated-icon' },
                    { label: 'Table', icon: 'pi pi-fw pi-table', routerLink: ['/uikit/table'] },
                    { label: 'List', icon: 'pi pi-fw pi-list', routerLink: ['/uikit/list'] },
                    { label: 'Tree', icon: 'pi pi-fw pi-share-alt', routerLink: ['/uikit/tree'] },
                    { label: 'Panel', icon: 'pi pi-fw pi-tablet', routerLink: ['/uikit/panel'] },
                    { label: 'Overlay', icon: 'pi pi-fw pi-clone', routerLink: ['/uikit/overlay'] },
                    { label: 'Media', icon: 'pi pi-fw pi-image', routerLink: ['/uikit/media'] },
                    { label: 'Menu', icon: 'pi pi-fw pi-bars', routerLink: ['/uikit/menu'], preventExact: true },
                    { label: 'Message', icon: 'pi pi-fw pi-comment', routerLink: ['/uikit/message'] },
                    { label: 'File', icon: 'pi pi-fw pi-file', routerLink: ['/uikit/file'] },
                    { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/uikit/charts'] },
                    { label: 'Misc', icon: 'pi pi-fw pi-circle-off', routerLink: ['/uikit/misc'] }
                ]
            },
            {
                label: 'Prime Blocks', icon: 'pi pi-fw pi-prime', routerLink: ['/blocks'],
                items: [
                    { label: 'Free Blocks', icon: 'pi pi-fw pi-eye', routerLink: ['/blocks'] },
                    { label: 'All Blocks', icon: 'pi pi-fw pi-globe', url: ['https://www.primefaces.org/primeblocks-ng'], target: '_blank' },
                ]
            },
            {
                label: 'Utilities', icon: 'pi pi-fw pi-compass', routerLink: ['/utilities'],
                items: [
                    { label: 'PrimeIcons', icon: 'pi pi-fw pi-prime', routerLink: ['utilities/icons'] },
                    { label: 'PrimeFlex', icon: 'pi pi-fw pi-desktop', url: ['https://www.primefaces.org/primeflex/'], target: '_blank' },
                ]
            },
            {
                label: 'Pages', icon: 'pi pi-fw pi-copy', routerLink: ['/pages'],
                items: [
                    { label: 'Clients', icon: 'pi pi-fw pi-id-card', routerLink: ['/pages/client'] },
                    { label: 'Catégories', icon: 'pi pi-fw pi-id-card', routerLink: ['/pages/categorie'] },
                    { label: 'Fournisseurs', icon: 'pi pi-fw pi-id-card', routerLink: ['/pages/fournisseur'] },
                    { label: 'Magasiniers', icon: 'pi pi-fw pi-id-card', routerLink: ['/pages/magasinier'] },
                    { label: 'Produits', icon: 'pi pi-fw pi-id-card', routerLink: ['/pages/produit'] },
                    { label: 'Utilisateurs', icon: 'pi pi-fw pi-id-card', routerLink: ['/pages/user'] },
                    { label: 'Rôles', icon: 'pi pi-fw pi-id-card', routerLink: ['/pages/role'] },
                    { label: 'Email', icon: 'pi pi-fw pi-id-card', routerLink: ['/pages/email'] },
                    { label: 'Documents', icon: 'pi pi-fw pi-id-card', routerLink: ['/pages/document'] },



                    { label: 'Calendar', icon: 'pi pi-fw pi-calendar-plus', routerLink: ['/pages/calendar'] },
                    { label: 'Timeline', icon: 'pi pi-fw pi-calendar', routerLink: ['/pages/timeline'] },
                    { label: 'Landing', icon: 'pi pi-fw pi-globe', url: 'assets/pages/landing.html', target: '_blank' },
                    { label: 'Login', icon: 'pi pi-fw pi-sign-in', routerLink: ['/login'], target: '_blank' },
                    { label: 'Error', icon: 'pi pi-fw pi-exclamation-triangle', routerLink: ['/error'], target: '_blank' },
                    { label: '404', icon: 'pi pi-fw pi-times', routerLink: ['/404'], target: '_blank' },
                    { label: 'Access Denied', icon: 'pi pi-fw pi-ban', routerLink: ['/accessdenied'], target: '_blank' },
                    { label: 'Empty', icon: 'pi pi-fw pi-clone', routerLink: ['/pages/empty'] },
                ]
            },

            {
                label: 'Vente', icon: 'pi pi-fw pi-copy', routerLink: ['/vente'],
                items: [
                    { label: 'Bon de Commande', icon: 'pi pi-fw pi-id-card', routerLink: ['/vente/bon-commande'], command: () => this.navigateToBonCommande() },
                    { label: 'Bon de Livraison', icon: 'pi pi-fw pi-id-card', routerLink: ['/vente/bondeLivraison'] },
                    { label: 'Facture', icon: 'pi pi-fw pi-id-card', routerLink: ['/vente/facture'] },
                    { label: 'Produits Commandés', icon: 'pi pi-fw pi-id-card', routerLink: ['/vente/produits-commandes'] },

                ]
            },
            {
                label: 'Achat', icon: 'pi pi-fw pi-copy', routerLink: ['/vente'],
                items: [
                    { label: 'Bon de Commande Fournisseur', icon: 'pi pi-fw pi-id-card', routerLink: ['/achat/bon-commande-fournisseur'] },
                    { label: 'Produits Fournisseurs', icon: 'pi pi-fw pi-id-card', routerLink: ['/achat/Produitfournisseur'] },
                    { label: 'Produits à modifier', icon: 'pi pi-fw pi-id-card', routerLink: ['/achat/Updateproduit'] },
                    { label: 'Bon de Reception', icon: 'pi pi-fw pi-id-card', routerLink: ['/achat/bon-reception'] },
                    { label: 'Facture', icon: 'pi pi-fw pi-id-card', routerLink: ['/vente/facture'] },
                ]
            },

            {
                label: 'Hierarchy', icon: 'pi pi-fw pi-sitemap',
                items: [
                    {
                        label: 'Submenu 1', icon: 'pi pi-fw pi-sign-in',
                        items: [
                            {
                                label: 'Submenu 1.1', icon: 'pi pi-fw pi-sign-in',
                                items: [
                                    { label: 'Submenu 1.1.1', icon: 'pi pi-fw pi-sign-in' },
                                    { label: 'Submenu 1.1.2', icon: 'pi pi-fw pi-sign-in' },
                                    { label: 'Submenu 1.1.3', icon: 'pi pi-fw pi-sign-in' },
                                ]
                            },
                            {
                                label: 'Submenu 1.2', icon: 'pi pi-fw pi-sign-in',
                                items: [
                                    { label: 'Submenu 1.2.1', icon: 'pi pi-fw pi-sign-in' }
                                ]
                            },
                        ]
                    },
                    {
                        label: 'Submenu 2', icon: 'pi pi-fw pi-sign-in',
                        items: [
                            {
                                label: 'Submenu 2.1', icon: 'pi pi-fw pi-sign-in',
                                items: [
                                    { label: 'Submenu 2.1.1', icon: 'pi pi-fw pi-sign-in' },
                                    { label: 'Submenu 2.1.2', icon: 'pi pi-fw pi-sign-in' },
                                ]
                            },
                            {
                                label: 'Submenu 2.2', icon: 'pi pi-fw pi-sign-in',
                                items: [
                                    { label: 'Submenu 2.2.1', icon: 'pi pi-fw pi-sign-in' },
                                ]
                            },
                        ]
                    }
                ]
            },
            {
                label: 'Docs', icon: 'pi pi-fw pi-file', routerLink: ['/documentation']
            },
            {
                label: 'Buy Now', icon: 'pi pi-fw pi-money-bill', url: ['https://www.primefaces.org/store']
            }
        ];
    }

    onMenuClick() {
        this.appMain.menuClick = true;
    }

    navigateToBonCommande() {
        sessionStorage.setItem('codeClasseDoc', 'BC');
      }
      
}
