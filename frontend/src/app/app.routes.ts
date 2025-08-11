import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ChangePasswordComponent } from './changepassword/changepassword.component';
import { HomePageComponent } from './homepage/homepage.component';
import { ListroomComponent } from './listroom/listroom.component';
import { ListserviceComponent } from './listservice/listservice.component';
import { ListbookingComponent } from './listbooking/listbooking.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MessageComponent } from './message/message.component';
import { HelpsComponent } from './helps/helps.component';
import { SettingComponent } from './setting/setting.component';
import { ProfileComponent } from './profile/profile.component';
import { DetailroomComponent } from './detailroom/detailroom.component';
import { BookinghistoryComponent } from './bookinghistory/bookinghistory.component';
import { BookingpaymentComponent } from './bookingpayment/bookingpayment.component';
import { ThongkeComponent } from './thongke/thongke.component';
import { QuanlyhoadonComponent } from './quanlyhoadon/quanlyhoadon.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'changepassword', component: ChangePasswordComponent },
  { path: 'listroom', component: ListroomComponent },
  { path: 'listservice', component: ListserviceComponent },
  { path: 'listbooking', component: ListbookingComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'message', component: MessageComponent },
  { path: 'helps', component: HelpsComponent },
  { path: 'setting', component: SettingComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'detailroom', component: DetailroomComponent },
  { path: 'bookinghistory', component: BookinghistoryComponent },
  { path: 'bookingpayment', component: BookingpaymentComponent },
  { path: 'thongke', component: ThongkeComponent },
  { path: 'quanlyhoadon', component: QuanlyhoadonComponent },
  {
    path: 'detailroom/:id',
    component: DetailroomComponent,
  },
];
