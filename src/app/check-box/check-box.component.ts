import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatIconButton} from "@angular/material/button";
import {NgIf} from "@angular/common";
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-check-box',
    imports: [
        MatIconModule,
        MatIconButton,
        NgIf
    ],
  templateUrl: './check-box.component.html',
  styleUrl: './check-box.component.scss'
})
export class CheckBoxComponent {

  private _value = false;

  @Input()
  set value(val: boolean) {
    this._value = val;
  }
  get value() {
    return this._value;
  }

  @Output()
  valueChange = new EventEmitter<boolean>(); // <-- importante

  changeValue() {
    this._value = !this._value;
    this.valueChange.emit(this._value);
  }

}
