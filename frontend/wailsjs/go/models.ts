export namespace main {
	
	export class Chapter {
	    id: number;
	    name: string;
	    book_id: number;
	    content?: string;
	    // Go type: time.Time
	    created_at: any;
	    // Go type: time.Time
	    updated_at?: any;
	    parent_id: number;
	    // Go type: time.Time
	    deleted_at?: any;
	
	    static createFrom(source: any = {}) {
	        return new Chapter(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.book_id = source["book_id"];
	        this.content = source["content"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	        this.parent_id = source["parent_id"];
	        this.deleted_at = this.convertValues(source["deleted_at"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class BookWithChapters {
	    id: number;
	    name: string;
	    author?: string;
	    // Go type: time.Time
	    created_at: any;
	    // Go type: time.Time
	    updated_at?: any;
	    summary?: string;
	    // Go type: time.Time
	    deleted_at?: any;
	    chapters: Chapter[];
	
	    static createFrom(source: any = {}) {
	        return new BookWithChapters(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.author = source["author"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	        this.summary = source["summary"];
	        this.deleted_at = this.convertValues(source["deleted_at"], null);
	        this.chapters = this.convertValues(source["chapters"], Chapter);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class UpdateChapterParams {
	    name: string;
	    content?: string;
	    id: number;
	
	    static createFrom(source: any = {}) {
	        return new UpdateChapterParams(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.content = source["content"];
	        this.id = source["id"];
	    }
	}
	export class Book {
	    id: number;
	    name: string;
	    author?: string;
	    // Go type: time.Time
	    created_at: any;
	    // Go type: time.Time
	    updated_at?: any;
	    summary?: string;
	    // Go type: time.Time
	    deleted_at?: any;
	
	    static createFrom(source: any = {}) {
	        return new Book(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.author = source["author"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	        this.summary = source["summary"];
	        this.deleted_at = this.convertValues(source["deleted_at"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

