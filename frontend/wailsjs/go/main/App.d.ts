// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {main} from '../models';

export function CreateBook(arg1:any):Promise<main.Book>;

export function CreateChapter(arg1:main.CreateChapterParams):Promise<main.Chapter>;

export function DeleteBook(arg1:number):Promise<Error>;

export function DeleteChapter(arg1:number):Promise<Error>;

export function GetBook(arg1:number):Promise<main.Book>;

export function GetBookWithChapters(arg1:number):Promise<main.BookWithChapters>;

export function GetChapter(arg1:number):Promise<main.Chapter>;

export function Greet(arg1:string):Promise<string>;

export function InsertChapterAfter(arg1:number,arg2:main.CreateChapterParams):Promise<main.Chapter>;

export function ListBooks(arg1:number):Promise<Array<main.Book>>;

export function ListChapters(arg1:number):Promise<Array<main.Chapter>>;

export function MoveChapter(arg1:number,arg2:number,arg3:number):Promise<main.Chapter>;

export function PublishBook(arg1:number,arg2:Array<string>,arg3:string,arg4:string):Promise<Error>;

export function RenderMarkdown(arg1:string):Promise<string>;

export function SelectCover():Promise<string>;

export function UpdateChapter(arg1:main.UpdateChapterParams):Promise<main.Chapter>;

export function UploadImage(arg1:string):Promise<string>;
