import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/Components/navbar/navbar';
import { Footer } from "./shared/Components/footer/footer";
import { BookCard } from "./features/products/card-componenet/book-card/book-card";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Footer, Navbar, BookCard],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'AseerElKotb';
}
