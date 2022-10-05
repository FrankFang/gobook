import { main } from '../wailsjs/go/models'
main.Book.prototype.convertValues
= main.Chapter.prototype.convertValues
= main.BookWithChapters.prototype.convertValues = function (a: any, Klass: any, asMap = false): any {
      if (!a) {
        return a
      }
      if (a.map) {
        return (a as any[]).map(elem => this.convertValues(elem, Klass))
      }
      else if (typeof a === 'object') {
        if (asMap) {
          for (const key of Object.keys(a)) {
            a[key] = new Klass(a[key])
          }
          return a
        }
        return new Klass(a)
      }
      return a
    }
