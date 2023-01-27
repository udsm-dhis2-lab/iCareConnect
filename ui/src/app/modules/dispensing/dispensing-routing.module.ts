import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CurrentPatientDispensingComponent } from './pages/current-patient-dispensing/current-patient-dispensing.component';
import { DispensingHomeComponent } from './pages/dispensing-home/dispensing-home.component';
import { DispensingPatientListComponent } from './pages/dispensing-patient-list/dispensing-patient-list.component';

const routes: Routes = [
  {
    path: '',
    component: DispensingPatientListComponent,
  },
  { path: ':id/:visitId', component: CurrentPatientDispensingComponent },
  { path: 'dispense', component: DispensingHomeComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DispensingRoutingModule {}
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

//connect to the MongoDB
mongoose.connect('mongodb://localhost:27017/icare', { useNewUrlParser: true });

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.post('/api/notification', (req, res) => {
    const { message, doctorId } = req.body;
    // save the notification to the database
    const notification = new Notification({ message, doctorId });
    notification.save((err) => {
    if (err) {
        res.status(500).send(err);
    } else {
        // send the notification to the doctor
        sendNotificationToDoctor(doctorId, message);
        res.status(200).send('Notification sent successfully');
    }
    });
});

// function to send notification to doctor
function sendNotificationToDoctor(doctorId, message) {
    // send the notification using a push notification service or email
}

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
