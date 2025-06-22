import { Component, OnInit } from '@angular/core';
import { AppMainComponent } from './app.main.component';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[];
    role: string[] = [];

    constructor(public appMain: AppMainComponent) { }

    ngOnInit() {
    const rolesString = localStorage.getItem('realm_roles') || '[]';
    this.role = JSON.parse(rolesString);

            console.log('Rôle de l\'utilisateur:', this.role);

        this.model = [
            //{ label: 'Dashboard1111', icon: 'pi pi-fw pi-home', routerLink: ['/'] },
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/dashboard'] },

           //{
               // label: 'UI Kit', icon: 'pi pi-fw pi-star-fill', routerLink: ['/uikit'],
                //items: [
                    //{ label: 'Form Layout', icon: 'pi pi-fw pi-id-card', routerLink: ['/uikit/formlayout'] },
                    //{ label: 'Input', icon: 'pi pi-fw pi-check-square', routerLink: ['/uikit/input'] },
                   // { label: 'Float Label', icon: 'pi pi-fw pi-bookmark', routerLink: ['/uikit/floatlabel'] },
                  //  { label: 'Invalid State', icon: 'pi pi-fw pi-exclamation-circle', routerLink: ['/uikit/invalidstate'] },
                   // { label: 'Button', icon: 'pi pi-fw pi-mobile', routerLink: ['/uikit/button'], class: 'rotated-icon' },
                   /// { label: 'Table', icon: 'pi pi-fw pi-table', routerLink: ['/uikit/table'] },
               ///     { label: 'List', icon: 'pi pi-fw pi-list', routerLink: ['/uikit/list'] },
                   /// { label: 'Tree', icon: 'pi pi-fw pi-share-alt', routerLink: ['/uikit/tree'] },
                   // { label: 'Panel', icon: 'pi pi-fw pi-tablet', routerLink: ['/uikit/panel'] },
                  //  { label: 'Overlay', icon: 'pi pi-fw pi-clone', routerLink: ['/uikit/overlay'] },
                   // { label: 'Media', icon: 'pi pi-fw pi-image', routerLink: ['/uikit/media'] },
                   // { label: 'Menu', icon: 'pi pi-fw pi-bars', routerLink: ['/uikit/menu'], preventExact: true },
                    //{ label: 'Message', icon: 'pi pi-fw pi-comment', routerLink: ['/uikit/message'] },
                   // { label: 'File', icon: 'pi pi-fw pi-file', routerLink: ['/uikit/file'] },
                   // { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/uikit/charts'] },
                   // { label: 'Misc', icon: 'pi pi-fw pi-circle-off', routerLink: ['/uikit/misc'] }
               // ]
           // },
           // {
               // label: 'Prime Blocks', icon: 'pi pi-fw pi-prime', routerLink: ['/blocks'],
                //items: [
                  //  { label: 'Free Blocks', icon: 'pi pi-fw pi-eye', routerLink: ['/blocks'] },
                  //  { label: 'All Blocks', icon: 'pi pi-fw pi-globe', url: ['https://www.primefaces.org/primeblocks-ng'], target: '_blank' },
               // ]
           // },
           // {
             //   label: 'Utilities', icon: 'pi pi-fw pi-compass', routerLink: ['/utilities'],
               // items: [
                 //   { label: 'PrimeIcons', icon: 'pi pi-fw pi-prime', routerLink: ['utilities/icons'] },
                   // { label: 'PrimeFlex', icon: 'pi pi-fw pi-desktop', url: ['https://www.primefaces.org/primeflex/'], target: '_blank' },
               // ]
            //},
            {
                 label: 'Pages',
                    icon: 'pi pi-fw pi-folder-open',
                    routerLink: ['/pages'],
                    items: [
                        { label: 'Clients', icon: 'pi pi-fw pi-users', routerLink: ['/pages/client'] },
                        { label: 'Catégories', icon: 'pi pi-fw pi-tags', routerLink: ['/pages/categorie'] },
                        { label: 'Fournisseurs', icon: 'pi pi-fw pi-briefcase', routerLink: ['/pages/fournisseur'] },
                        { label: 'Magasiniers', icon: 'pi pi-fw pi-building', routerLink: ['/pages/magasinier'] },
                        { label: 'Produits', icon: 'pi pi-fw pi-box', routerLink: ['/pages/produit'] },
                        { label: 'Utilisateurs', icon: 'pi pi-fw pi-user', routerLink: ['/pages/user'] },
                        { label: 'Rôles', icon: 'pi pi-fw pi-lock', routerLink: ['/pages/role'] },
                        { label: 'Email', icon: 'pi pi-fw pi-envelope', routerLink: ['/pages/email'] },
                        { label: 'Documents', icon: 'pi pi-fw pi-file', routerLink: ['/pages/document'] }
  



                   // { label: 'Calendar', icon: 'pi pi-fw pi-calendar-plus', routerLink: ['/pages/calendar'] },
                    //{ label: 'Timeline', icon: 'pi pi-fw pi-calendar', routerLink: ['/pages/timeline'] },
                    //{ label: 'Landing', icon: 'pi pi-fw pi-globe', url: 'assets/pages/landing.html', target: '_blank' },
                   // { label: 'Login', icon: 'pi pi-fw pi-sign-in', routerLink: ['/login'], target: '_blank' },
                  //  { label: 'Error', icon: 'pi pi-fw pi-exclamation-triangle', routerLink: ['/error'], target: '_blank' },
                  //  { label: '404', icon: 'pi pi-fw pi-times', routerLink: ['/404'], target: '_blank' },
                   // { label: 'Access Denied', icon: 'pi pi-fw pi-ban', routerLink: ['/accessdenied'], target: '_blank' },
                   // { label: 'Empty', icon: 'pi pi-fw pi-clone', routerLink: ['/pages/empty'] },
                ]
            },

            {
    label: 'Vente', icon: 'pi pi-fw pi-shopping-cart', routerLink: ['/vente'],
    items: [
        ...(this.role.includes('isAdmin') ? [
            {
                label: 'Bon de Commande',
                icon: 'pi pi-fw pi-pencil',                
                routerLink: ['/vente/bon-commande'],
                command: () => this.navigateToBonCommande()
            }
        ] : []),
                {
            label: 'Produits Commandés',
            icon: 'pi pi-fw pi-tags',
            routerLink: ['/vente/produits-commandes']
        },
        {
            label: 'Bon de Livraison',
            icon: 'pi pi-fw pi-send',
            routerLink: ['/vente/bondeLivraison']
        },
        {
            label: 'Facture',
            icon: 'pi pi-fw pi-file',
            routerLink: ['/vente/facture']
        }

    ]
},
{
    label: 'Achat', icon: 'pi pi-fw pi-briefcase', routerLink: ['/achat'],
    items: [
        {
            label: 'Bon de Commande Fournisseur',
            icon: 'pi pi-fw pi-pencil',
            routerLink: ['/achat/bon-commande-fournisseur'],
            command: () => this.navigateToBonCommandeFournisseur()
        },
        {
            label: 'Produits Fournisseurs',
            icon: 'pi pi-fw pi-shopping-cart',
            routerLink: ['/achat/Produitfournisseur']
        },
        {
            label: 'Bon de Réception',
            icon: 'pi pi-fw pi-download',
            routerLink: ['/achat/bon-reception']
        },
        {
            label: 'Facture',
            icon: 'pi pi-fw pi-file',
            routerLink: ['/vente/facture']
        }
    ]
},


           // {
             //   label: 'Hierarchy', icon: 'pi pi-fw pi-sitemap',
               // items: [
                 //   {
                   //     label: 'Submenu 1', icon: 'pi pi-fw pi-sign-in',
                     //   items: [
                       //     {
                         //       label: 'Submenu 1.1', icon: 'pi pi-fw pi-sign-in',
                           //     items: [
                             //       { label: 'Submenu 1.1.1', icon: 'pi pi-fw pi-sign-in' },
                               //     { label: 'Submenu 1.1.2', icon: 'pi pi-fw pi-sign-in' },
                                 //   { label: 'Submenu 1.1.3', icon: 'pi pi-fw pi-sign-in' },
                               // ]
                           // },
                           // {
                             //   label: 'Submenu 1.2', icon: 'pi pi-fw pi-sign-in',
                               // items: [
                                 //   { label: 'Submenu 1.2.1', icon: 'pi pi-fw pi-sign-in' }
                               // ]
                           // },
                       // ]
                   // },
                   // {
                     //   label: 'Submenu 2', icon: 'pi pi-fw pi-sign-in',
                       // items: [
                         //   {
                           //     label: 'Submenu 2.1', icon: 'pi pi-fw pi-sign-in',
                             //   items: [
                               //     { label: 'Submenu 2.1.1', icon: 'pi pi-fw pi-sign-in' },
                                 //   { label: 'Submenu 2.1.2', icon: 'pi pi-fw pi-sign-in' },
                               // ]
                           // },
                           // {
                             //   label: 'Submenu 2.2', icon: 'pi pi-fw pi-sign-in',
                               // items: [
                                 //   { label: 'Submenu 2.2.1', icon: 'pi pi-fw pi-sign-in' },
                               // ]
                            //},
                     //   ]
                   // }
                //]
            //},
            //{
              //  label: 'Docs', icon: 'pi pi-fw pi-file', routerLink: ['/documentation']
            //},
            //{
              //  label: 'Buy Now', icon: 'pi pi-fw pi-money-bill', url: ['https://www.primefaces.org/store']
           // }
        ];
    }

    onMenuClick() {
        this.appMain.menuClick = true;
    }

    navigateToBonCommande() {
        sessionStorage.setItem('codeClasseDoc', 'BC');
      }
    navigateToBonCommandeFournisseur() {
        sessionStorage.setItem('codeClasseDoc', 'BCF');
      }
      
}
