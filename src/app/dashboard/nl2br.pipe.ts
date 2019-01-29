import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'nl2br'
})
export class Nl2BrPipe implements PipeTransform {

    transform(value: string, args?: any): string {
        if (typeof value === 'undefined' || value === null) {
            return '';
        }
        // var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
        // return (value + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
        return (value + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2');
    }

}
