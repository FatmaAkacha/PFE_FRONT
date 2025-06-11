import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';

import {DashboardDemoComponent} from './demo/view/dashboarddemo.component';
import {FormLayoutDemoComponent} from './demo/view/formlayoutdemo.component';
import {FloatLabelDemoComponent} from './demo/view/floatlabeldemo.component';
import {InvalidStateDemoComponent} from './demo/view/invalidstatedemo.component';
import {InputDemoComponent} from './demo/view/inputdemo.component';
import {ButtonDemoComponent} from './demo/view/buttondemo.component';
import {TableDemoComponent} from './demo/view/tabledemo.component';
import {ListDemoComponent} from './demo/view/listdemo.component';
import {TreeDemoComponent} from './demo/view/treedemo.component';
import {PanelsDemoComponent} from './demo/view/panelsdemo.component';
import {OverlaysDemoComponent} from './demo/view/overlaysdemo.component';
import {MediaDemoComponent} from './demo/view/mediademo.component';
import {MessagesDemoComponent} from './demo/view/messagesdemo.component';
import {MiscDemoComponent} from './demo/view/miscdemo.component';
import {EmptyDemoComponent} from './demo/view/emptydemo.component';
import {ChartsDemoComponent} from './demo/view/chartsdemo.component';
import {FileDemoComponent} from './demo/view/filedemo.component';
import {DocumentationComponent} from './demo/view/documentation.component';
import {IconsComponent} from './utilities/icons.component';

import {AppMainComponent} from './app.main.component';
import {AppNotfoundComponent} from './pages/app.notfound.component';
import {AppErrorComponent} from './pages/app.error.component';
import {AppAccessdeniedComponent} from './pages/app.accessdenied.component';
import {AppLoginComponent} from './pages/app.login.component';
import {AppCrudComponent} from './pages/app.crud.component';
import {AppCalendarComponent} from './pages/app.calendar.component';
import {AppTimelineDemoComponent} from './pages/app.timelinedemo.component';
import {BlocksComponent} from './blocks/blocks/blocks.component';
import { ClientComponent } from './demo/component/client/client.component';
import { FournisseurComponent } from './demo/component/fournisseur/fournisseur.component';
import { ProduitComponent } from './demo/component/produit/produit.component';
import { DevisComponent } from './vente/devis/devis.component';
import { FactureComponent } from './vente/facture/facture.component';
import { BonLivraisonComponent } from './vente/bon-livraison/bon-livraison.component';
import { BonCommandeFournisseurComponent } from './achat/bon-commande-fournisseur/bon-commande-fournisseur.component';
import { BonReceptionComponent } from './achat/bon-reception/bon-reception.component';
import { ProduitsCommandesComponent } from './pages/produits-commandes/produits-commandes.component';
import { DocumentComponent } from './document/document.component';
import { PanierComponent } from './panier/panier.component';
import { CategorieComponent } from './demo/component/categorie/categorie.component';
import { UserComponent } from './demo/component/user/user.component';
import { EmailComponent } from './demo/component/email/email.component';
import { RoleComponent } from './demo/component/role/role.component';
import { FournisseurAjoutProduitComponent } from './achat/fournisseur-ajout-produit/fournisseur-ajout-produit.component';
import { MagasinierComponent } from './demo/component/magasinier/magasinier.component';

@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: '', component: AppMainComponent,
                children: [
                    {path: '', component: DashboardDemoComponent},
                    {path: 'uikit/formlayout', component: FormLayoutDemoComponent},
                    {path: 'uikit/floatlabel', component: FloatLabelDemoComponent},
                    {path: 'uikit/invalidstate', component: InvalidStateDemoComponent},
                    {path: 'uikit/input', component: InputDemoComponent},
                    {path: 'uikit/button', component: ButtonDemoComponent},
                    {path: 'uikit/table', component: TableDemoComponent},
                    {path: 'uikit/list', component: ListDemoComponent},
                    {path: 'uikit/tree', component: TreeDemoComponent},
                    {path: 'uikit/panel', component: PanelsDemoComponent},
                    {path: 'uikit/overlay', component: OverlaysDemoComponent},
                    {path: 'uikit/media', component: MediaDemoComponent},
                    {path: 'uikit/menu', loadChildren: () => import('./demo/view/menus/menus.module').then(m => m.MenusModule)},
                    {path: 'uikit/message', component: MessagesDemoComponent},
                    {path: 'uikit/misc', component: MiscDemoComponent},
                    {path: 'uikit/charts', component: ChartsDemoComponent},
                    {path: 'uikit/file', component: FileDemoComponent},
                    {path: 'utilities/icons', component: IconsComponent},
                    {path: 'pages/empty', component: EmptyDemoComponent},
                    {path: 'pages/crud', component: AppCrudComponent},
                    {path: 'pages/client', component: ClientComponent},
                    {path: 'pages/categorie', component: CategorieComponent},
                    {path: 'pages/fournisseur', component: FournisseurComponent},
                    {path: 'pages/magasinier', component: MagasinierComponent},
                    {path: 'pages/produit', component: ProduitComponent},
                    {path: 'pages/user', component: UserComponent},
                    {path: 'pages/email', component: EmailComponent},
                    {path: 'pages/role', component: RoleComponent},
                    {path: 'pages/document', component: DocumentComponent },


                    {path: 'vente/bon-commande', component: DevisComponent},
                    { path: 'vente/bon-livraison/:id', component: BonLivraisonComponent },
                    { path: 'vente/facture/:id', component: FactureComponent }, 
                    { path: 'vente/produits-commandes', component: ProduitsCommandesComponent },


                    { path: 'vente/panier', component: PanierComponent },

                    { path: 'achat/bon-commande-fournisseur', component: BonCommandeFournisseurComponent }, 
                    { path: 'achat/Produitfournisseur', component:FournisseurAjoutProduitComponent  }, 
                    { path: 'achat/bon-reception/:id', component: BonReceptionComponent }, 

                    {path: 'pages/calendar', component: AppCalendarComponent},
                    {path: 'pages/timeline', component: AppTimelineDemoComponent},
                    {path: 'components/charts', component: ChartsDemoComponent},
                    {path: 'components/file', component: FileDemoComponent},
                    {path: 'documentation', component: DocumentationComponent},
                    {path: 'blocks', component: BlocksComponent},
                ]
            },
            {path: 'error', component: AppErrorComponent},
            {path: 'accessdenied', component: AppAccessdeniedComponent},
            {path: 'notfound', component: AppNotfoundComponent},
            {path: 'login', component: AppLoginComponent},
            {path: '**', redirectTo: '/notfound'},
        ], {scrollPositionRestoration: 'enabled'})
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
