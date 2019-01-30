import { Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';
import { AssystAPIService } from '../assyst/assyst-api.service';
import { LayoutHelperService } from '../layout-helper.service';

declare var $: any;

@Pipe({
    name: 'assystFixHtml'
})
export class AssystFixHtmlPipe implements PipeTransform {
    private idLoadingImage: number = 0;

    constructor (
        private router: Router,
        private assyst: AssystAPIService,
        private layoutHelper: LayoutHelperService
    ) { }

    transform(value: string, args?: any): string {
        if (value) {
            var html = value;
            var htmlImages = html.match(/<img.*?src="icons\/(Icon|Image)Download.*?imageName=([^"]+)[^>]*?>/gi);
            if (htmlImages) {
                htmlImages.forEach(img => {
                    var idLoadedImage = this.idLoadingImage++;

                    var attrs = {};
                    img.match(/(\w+)="([^"]+)?"/gi).forEach(attr => {
                        var aux = /(\w+)="([^"]+)?"/gi.exec(attr);
                        attrs[aux[1]] = this.layoutHelper.decodeHTML(aux[2]);
                    })
                    
                    if (attrs['src']) {
                        {
                            var imageName = 'assyst-img.png';
                            let aux = /imageName=([^&]+)/gi.exec(attrs['src']);
                            if (aux && aux[1]) {
                                imageName = aux[1];
                            }
                        }

                        img.match(/(\w+)="([^"]+)?"/gi).forEach(attr => {
                            let aux = /(\w+)="([^"]+)?"/gi.exec(attr);
                            attrs[aux[1]] = this.layoutHelper.decodeHTML(aux[2]);
                        })

                        html = html.replace(img, '<div class="default-loader" id="image-loader-' + idLoadedImage + '"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div>')
                        var url = this.assyst.getRESTEndpoint(attrs['src']);

                        var headers = this.assyst.getHttpHeaders();

                        var request = new XMLHttpRequest();
                        request.responseType = "blob";
                        request.onload = function() {
                            attrs['src'] = URL.createObjectURL(this.response);
                            $('#image-loader-' + idLoadedImage).replaceWith(
                                $('<div/>', {
                                    'class': 'image-wrapper',
                                    html: [
                                        $('<img/>', attrs),
                                        $('<a/>', {
                                            href: attrs['src'],
                                            'download': imageName,
                                            html: '<i class="material-icons">file_download</i>'
                                        })
                                    ]
                                })
                            );
                        }
                        request.open("GET", url);
                        headers.keys().forEach((h) => request.setRequestHeader(h, headers.get(h)));
                        request.send();
                    }
                    
                });
            }

            // var regex = /<a[^>]*?href="https?:\/\/[^\/]+\/assystweb\/application.do#management\/KnowledgeProcedure.do\?[^>]*?id=([0-9]+)[^>]*>/gi;
            var regex = /<a[^>]*?href="https?:\/\/[^\/]+\/assystweb\/application\.do#management(?:\/|%2F)KnowledgeProcedure\.do(?:\?|%3F)[^>]*?id(?:=|%3D)([0-9]+)[^>]*>/gi;
            var knowledgeLinks = html.match(regex);
            if (knowledgeLinks) {
                knowledgeLinks.forEach(link => {
                    var aux = regex.exec(link);
                    if (!aux) {
                        console.log('Log', link, 'Aux:', aux);
                    }
                    if (aux && aux[1]) {
                        html = html.replace(link, '<a href="dash/knowledge/' + aux[1] + '">');
                        // html = html.replace(link, '<a href="' + this.router.serializeUrl(this.router.createUrlTree(['dash/knowledge', aux[1]])) + '">');
                    }
                });
            }
            value = html;
        }
        return value;
    }

}
