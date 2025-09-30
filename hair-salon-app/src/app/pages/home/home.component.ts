import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceService } from '../../core/services/service.service';
import { Service } from '../../core/models/service.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  services: Service[] = [];
  loading = true;

  constructor(private serviceService: ServiceService) {}

  ngOnInit() {
    this.loadServices();
  }

  private loadServices() {
    this.serviceService.getActiveServices().subscribe({
      next: (services) => {
        this.services = services;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading services:', err);
        this.loading = false;
      }
    });
  }
}

