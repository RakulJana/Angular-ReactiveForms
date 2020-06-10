import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { debounceTime, map } from 'rxjs/operators';

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
  emailMessage: string;

  private validationMessages = { // add the validation messages based on key and value pairs
    required: 'Please enter your email address',
    email: 'Please eneter a valid email address'
  }

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


    this.customerForm.get('notification').valueChanges.subscribe( // dont rely on html to view changes on the input element
      value => this.setNotification(value)
    ) // need to consider how to react to these changes

    const emailControl = this.customerForm.get('emailGroup.email') // reference to email
    emailControl.valueChanges.pipe(
      debounceTime(1000)
    )
    .subscribe(
      value => this.setMessage(emailControl)
    )

  }

  save() {
    console.log(this.customerForm);
    console.log('Saved: ' + JSON.stringify(this.customerForm.value));
  }

  setMessage(c:AbstractControl): void {
    this.emailMessage = '' // clear current message 
    if((c.touched || c.dirty)&&c.errors){
      this.emailMessage = Object.keys(c.errors).map( // return array of validation errors as the main key
        key=> this.validationMessages[key]).join('') // map object key into this and checks 
      
    }
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
