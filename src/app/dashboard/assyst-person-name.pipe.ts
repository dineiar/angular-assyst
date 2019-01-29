import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'assystPersonName'
})
export class AssystPersonNamePipe implements PipeTransform {

    transform(value: string, args?: any): string {
        if (value) {
            var pieces = value.split(' ');
            for ( var i = 0; i < pieces.length; i++ )
            {
                if (pieces[i].match(/^(da|dos|de)$/gi)) {
                    pieces[i] = pieces[i].toLowerCase();
                } else {
                    var j = pieces[i].charAt(0).toUpperCase();
                    pieces[i] = j + pieces[i].substr(1).toLowerCase();
                }
            }
            return pieces.join(' ');
        }
        return value;
    }

}
