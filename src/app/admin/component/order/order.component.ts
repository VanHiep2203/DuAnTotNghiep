import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderHistory } from 'src/model/orderHistory';
import { OrderService } from 'src/service/adminService/orderService/order.service';
import Swal from 'sweetalert2'
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {

  orders!: OrderHistory[];
  page = 1;
  pageSize = 5;
  totalLength: any;
  orderList: String = ''
  isDesc: boolean = true;
  orderSort: String = ''
  orderDetails!: any;
  orderHistory: OrderHistory = new OrderHistory();
  FILTER_PAG_REGEX = /[^0-9]/g;

  constructor(
    public orderService: OrderService,
    private router: Router,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.getAllOrders();
    this.getOderSize();
  }

  getAllOrders() {
    this.spinner.show();
    return this.orderService.getAllOrders().subscribe(data => {
      setTimeout(() => {
        console.log(data);
        this.orders = data;
        this.spinner.hide();
      },1500)
    })
  }

  /** Get size of list order */

  getOderSize() {
    this.orderService.getOrderSize().subscribe(data => {
      this.totalLength = data;
    })
  }

  /** Change pageSize */

  selectPage(page: string) {
    this.page = parseInt(page) || 1;
  }

  /** Format input */

  formatInput(input: HTMLInputElement) {
    input.value = input.value.replace(this.FILTER_PAG_REGEX, '');
  }

  /** Sort list orders */

  sort(header: any) {
    this.isDesc = !this.isDesc
    this.orderSort = header
  }

  /** Search order by name */

  searchOrder(key: string): void {
    const result: OrderHistory[] = [];
    key = key.trim();
    for (const ct of this.orders) {
      if (ct.custommer.fullname.toLowerCase().indexOf(key.toLowerCase()) !== -1) {
        result.push(ct)
      }
    }
    this.orders = result
    this.totalLength = result.length
    this.page = 1
    if (result.length === 0 || !key) {
      this.totalLength = result.length
      this.page = 1
    }
    if (!key) {
      this.ngOnInit()
    }
  }

  /** Get order detail by orderId */

  getOrderDetail(orderId: any) {
    this.orderService.getOrderDetail(orderId).subscribe(data => {
      console.log(data);
      this.orderDetails = data;
    })
  }

  /** Confilm order */

  confilmOrder(orderId: any) {
    Swal.fire({
      title: 'Bạn có chắc?',
      text: 'Bạn có chắc muốn xác nhận đơn hàng này?!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Có, Xác nhận đơn hàng!',
      cancelButtonText: 'Không, không xác nhận'
    }).then((result) => {
      if (result.value) {
        this.orderService.updateOrderDelivering(orderId, this.orderHistory).subscribe((data: any) => {
          if (data.status === true) {
            this.orderHistory.status = 2;
            Swal.fire("Thành công!", "Đơn hàng đã được xác nhận!", "success");
            this.ngOnInit();
          }
          if (data.status === false) {
            Swal.fire("Xác nhận đơn hàng lỗi!", "System error!", "error");
          }
        })
      }
      else if (result.dismiss == Swal.DismissReason.cancel) { }
    })
  }
}
