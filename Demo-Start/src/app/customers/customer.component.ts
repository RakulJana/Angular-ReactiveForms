import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';

import { Customer } from './customer';


// can encapsulate this function into a more complex function that takes in more controls as a parameter

function ratingRange(min: number, max:number): ValidatorFn { // factory function passes in parameters into the validator function 
  return (c: AbstractControl): {[key:string]:boolean} | null => {
    if(c.value !== null && (isNaN(c.value) || c.value<min || c.value > max)){ // check if control has a value that is not null etc.. 
      return {'range': true} // return the same name as the init error name, error name is set to range  
    }
    return null;
  }
}
function emailMatch(c: AbstractControl): {[key:string]: boolean}|null {
  const emailValue = c.get('email')
  const emailCopyValue = c.get('confirmEmail')

  if(emailValue.pristine || emailCopyValue.pristine){
    return null;
  }

  if(emailValue.value !== emailCopyValue.value){
    return{'match': true}
  }
  return null
}
/*function ratingRange(c: AbstractControl): {[key: string]: boolean} | null{ // takes in form control or formgroup 
  if(c.value !== null && (isNaN(c.value) || c.value<1 || c.value > 5)){ // check if control has a value that is not null etc.. 
    return {'range': true} // return the same name as the init error name, error name is set to range  
  }
  return null;
}*/

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  customer = new Customer(); // customer property to bind
  customerForm: FormGroup

  constructor(private fb: FormBuilder) { }

  ngOnInit():void {
    this.customerForm = this.fb.group({
      firstName:['', [Validators.required, Validators.minLength(3)]],
      lastName:['', [Validators.required, Validators.maxLength(50)]],
      emailGroup: this.fb.group({
        email:['', [Validators.required, Validators.email]],
        confirmEmail: ['', Validators.required] 
      }, {validator: emailMatch}),
      sendCatalog: true,
      phone:[''],
      rating: [null, ratingRange(1,5)], // between 1 and 5
      notification: ['email']
    });
    this.customerForm.get('notification').valueChanges.subscribe(
      value => console.log(value)
    ) // need to consider how to react to these changes

    


  }

  save() {
    console.log(this.customerForm);
    console.log('Saved: ' + JSON.stringify(this.customerForm.value));
  }

  setNotification(notifyVia: string): void { // we change the validation of the phone input accordingly 
    const phoneControl = this.customerForm.get('phone');
    if (notifyVia === 'text') { // if notified via the phone 
      phoneControl.setValidators(Validators.required) // we are gonna set the phone control validator to required 
    } else {
      phoneControl.clearValidators() // if it is not set to phone, we clear it 
    }
    phoneControl.updateValueAndValidity(); // updates accordingly at the end of the function 
  }

  // instead of setnotification we should watch from the begining
}
