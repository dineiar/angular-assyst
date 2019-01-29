import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'assystEventDate'
})
export class AssystEventDatePipe implements PipeTransform {

    transform(value: string, args?: any): string {
        if (value) {
            var dateLogged = new Date(value);
            if ((new Date(value)).setHours(0,0,0,0) == (new Date()).setHours(0,0,0,0)) {
                return dateLogged.toLocaleTimeString(undefined, {hour:'2-digit', minute:'2-digit'});
            } else {
                if (dateLogged.getFullYear() == (new Date()).getFullYear()) {
                    return  dateLogged.toLocaleString(undefined, {month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'});
                } else {
                    return  dateLogged.toLocaleString(undefined, {year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'});
                }
            }
        }
    }

}
