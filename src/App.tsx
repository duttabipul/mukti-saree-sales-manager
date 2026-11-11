import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";

type Screen =
  | "dashboard"
  | "new-sale"
  | "items"
  | "payment"
  | "confirmation"
  | "transactions"
  | "transaction-detail"
  | "customers"
  | "customer-detail"
  | "dues"
  | "due-detail"
  | "due-payment-confirmation"
  | "advances"
  | "advance-detail"
  | "stock"
  | "add-stock"
  | "stock-detail"
  | "staff"
  | "employee-detail"
  | "profit"
  | "backups"
  | "access"
  | "my-attendance"
  | "clock";
type SaleSource = "Store Sale" | "Home Sale";
type PaymentMethod = "Cash" | "Bank Transfer" | "bKash" | "Nagad";
type DuePaymentMethod = PaymentMethod;
type IconName =
  | "arrow"
  | "bag"
  | "box"
  | "calendar"
  | "card"
  | "chart"
  | "check"
  | "chevron"
  | "clock"
  | "close"
  | "database"
  | "home"
  | "invoice"
  | "menu"
  | "plus"
  | "search"
  | "shield"
  | "store"
  | "user"
  | "users"
  | "wallet";

type SaleItem = {
  id: number;
  product: string;
  quantity: number;
  price: number;
};

type SaleRecord = {
  id: number;
  invoiceId: string;
  date: string;
  customer: string;
  source: SaleSource;
  items: SaleItem[];
  total: number;
  paid: number;
  due: number;
  advanceUsed: number;
  customerAdvance: number;
  changeReturned: number;
  method: PaymentMethod;
  employeeId: string;
  employeeName: string;
  time: string;
  transactionType: "Sale";
};

type BackupRecord = {
  id: number;
  date: string;
  time: string;
  type: string;
};

type DuePaymentRecord = {
  id: number;
  reference: string;
  customerId: string;
  customerName: string;
  amountReceived: number;
  method: PaymentMethod;
  date: string;
  time: string;
  employeeName: string;
  employeeId: string;
  previousDue: number;
  remainingDue: number;
  changeReturned: number;
  advanceCreated: number;
};

type ProtectedSection =
  | "new-sale"
  | "customers"
  | "dues"
  | "advances"
  | "profit"
  | "staff"
  | "backups"
  | "access";

type DueEvent = {
  id: number;
  type: "Purchase" | "Payment";
  date: string;
  detail: string;
  amount: number;
  method?: DuePaymentMethod;
  appliedToDue?: number;
  changeReturned?: number;
  advanceCreated?: number;
};

type DueCustomer = {
  id: number;
  name: string;
  phone: string;
  due: number;
  advance?: number;
  lastPurchase: string;
  history: DueEvent[];
  advanceHistory?: AdvanceTransaction[];
};

type AdvanceTransaction = {
  id: number;
  date: string;
  amountAdded: number;
  amountUsed: number;
  source: string;
  method: PaymentMethod;
  remainingBalance: number;
};

type Employee = {
  id: number;
  employeeId: string;
  name: string;
  role: string;
  phone: string;
  joiningDate: string;
  daysWorked: number;
  hoursWorked: number;
  salary: number;
  overtime: number;
  advance: number;
  paid: number;
};

type AttendanceSession = {
  id: number;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  clockInTimestamp: number;
  clockOutTimestamp?: number;
  minutes: number;
};

type StockAddition = {
  id: number;
  date: string;
  quantity: number;
  supplier: string;
  totalCost: number;
  notes?: string;
  employeeId?: string;
  employeeName?: string;
  time?: string;
  reference?: string;
  transactionType?: "Stock Entry";
};

type InventoryProduct = {
  id: number;
  name: string;
  category: string;
  detail: string;
  quantity: number;
  color: string;
  buyingPrice: number;
  sellingPrice: number;
  additions: StockAddition[];
};

type StockEntryForm = {
  mode: "existing" | "new";
  productId: string;
  name: string;
  category: string;
  quantity: string;
  buyingPrice: string;
  sellingPrice: string;
  supplier: string;
  date: string;
  additionalCost: string;
  notes: string;
};

const initialDueCustomers: DueCustomer[] = [
  {
    id: 1,
    name: "Farzana Rahman",
    phone: "01712 345 678",
    due: 3800,
    lastPurchase: "22 May 2025",
    history: [
      {
        id: 11,
        type: "Purchase",
        date: "22 May 2025",
        detail: "Silk sari · INV-008",
        amount: 6200,
      },
      {
        id: 12,
        type: "Payment",
        date: "22 May 2025",
        detail: "Payment received",
        amount: 2400,
        method: "Cash",
      },
    ],
  },
  {
    id: 2,
    name: "Nusrat Jahan",
    phone: "01819 562 410",
    due: 2400,
    lastPurchase: "20 May 2025",
    history: [
      {
        id: 21,
        type: "Purchase",
        date: "20 May 2025",
        detail: "Jamdani sari · INV-004",
        amount: 4800,
      },
      {
        id: 22,
        type: "Payment",
        date: "20 May 2025",
        detail: "Payment received",
        amount: 2400,
        method: "bKash",
      },
    ],
  },
  {
    id: 3,
    name: "Shahana Akter",
    phone: "01635 778 921",
    due: 1950,
    lastPurchase: "18 May 2025",
    history: [
      {
        id: 31,
        type: "Purchase",
        date: "18 May 2025",
        detail: "Manipuri sari · INV-197",
        amount: 3650,
      },
      {
        id: 32,
        type: "Payment",
        date: "18 May 2025",
        detail: "Payment received",
        amount: 1700,
        method: "Cash",
      },
    ],
  },
  {
    id: 4,
    name: "Rumana Chowdhury",
    phone: "01911 403 866",
    due: 1750,
    lastPurchase: "15 May 2025",
    history: [
      {
        id: 41,
        type: "Purchase",
        date: "15 May 2025",
        detail: "Cotton sari · INV-191",
        amount: 2750,
      },
      {
        id: 42,
        type: "Payment",
        date: "15 May 2025",
        detail: "Payment received",
        amount: 1000,
        method: "Cash",
      },
    ],
  },
  {
    id: 5,
    name: "Tahmina Sultana",
    phone: "01780 144 592",
    due: 1500,
    lastPurchase: "12 May 2025",
    history: [
      {
        id: 51,
        type: "Purchase",
        date: "12 May 2025",
        detail: "Tangail sari · INV-184",
        amount: 3200,
      },
      {
        id: 52,
        type: "Payment",
        date: "12 May 2025",
        detail: "Payment received",
        amount: 1700,
        method: "Bank Transfer",
      },
    ],
  },
  {
    id: 6,
    name: "Salma Begum",
    phone: "01842 930 115",
    due: 1000,
    lastPurchase: "08 May 2025",
    history: [
      {
        id: 61,
        type: "Purchase",
        date: "08 May 2025",
        detail: "Cotton sari · INV-176",
        amount: 2750,
      },
      {
        id: 62,
        type: "Payment",
        date: "08 May 2025",
        detail: "Payment received",
        amount: 1750,
        method: "Cash",
      },
    ],
  },
  {
    id: 7,
    name: "Nabil Islam",
    phone: "Not provided",
    due: 0,
    advance: 500,
    lastPurchase: "23 May 2025",
    history: [
      {
        id: 71,
        type: "Purchase",
        date: "23 May 2025",
        detail: "Manipuri sari · INV-009",
        amount: 3700,
      },
      {
        id: 72,
        type: "Payment",
        date: "23 May 2025",
        detail: "Payment received",
        amount: 4200,
        method: "bKash",
      },
    ],
    advanceHistory: [
      {
        id: 73,
        date: "23 May 2025",
        amountAdded: 500,
        amountUsed: 0,
        source: "Sale overpayment · INV-009",
        method: "bKash",
        remainingBalance: 500,
      },
    ],
  },
  {
    id: 8,
    name: "Maliha Karim",
    phone: "01790 661 428",
    due: 0,
    advance: 1200,
    lastPurchase: "19 May 2025",
    history: [
      {
        id: 81,
        type: "Purchase",
        date: "19 May 2025",
        detail: "Jamdani sari · INV-006",
        amount: 4800,
      },
      {
        id: 82,
        type: "Payment",
        date: "19 May 2025",
        detail: "Payment received",
        amount: 6000,
        method: "Cash",
      },
    ],
    advanceHistory: [
      {
        id: 83,
        date: "19 May 2025",
        amountAdded: 1200,
        amountUsed: 0,
        source: "Sale overpayment · INV-006",
        method: "Cash",
        remainingBalance: 1200,
      },
    ],
  },
];

const initialStockProducts: InventoryProduct[] = [
  {
    id: 1,
    name: "Jamdani",
    category: "Handwoven",
    detail: "Handwoven · Premium",
    quantity: 12,
    color: "#B86855",
    buyingPrice: 3600,
    sellingPrice: 4800,
    additions: [
      { id: 101, date: "18 May 2025", quantity: 6, supplier: "Dhaka Weaves", totalCost: 21800 },
    ],
  },
  {
    id: 2,
    name: "Silk",
    category: "Pure Silk",
    detail: "Pure silk · Festive",
    quantity: 3,
    color: "#B89045",
    buyingPrice: 4850,
    sellingPrice: 6200,
    additions: [
      {
        id: 102,
        date: "12 May 2025",
        quantity: 4,
        supplier: "Rajshahi Silk House",
        totalCost: 19800,
      },
    ],
  },
  {
    id: 3,
    name: "Manipuri",
    category: "Traditional",
    detail: "Traditional weave",
    quantity: 9,
    color: "#71836C",
    buyingPrice: 2700,
    sellingPrice: 3650,
    additions: [
      {
        id: 103,
        date: "15 May 2025",
        quantity: 5,
        supplier: "Heritage Handloom",
        totalCost: 13750,
      },
    ],
  },
  {
    id: 4,
    name: "Cotton",
    category: "Everyday Cotton",
    detail: "Soft cotton · Everyday",
    quantity: 18,
    color: "#A47C68",
    buyingPrice: 1900,
    sellingPrice: 2750,
    additions: [
      {
        id: 104,
        date: "20 May 2025",
        quantity: 10,
        supplier: "Bengal Cotton Works",
        totalCost: 19200,
      },
    ],
  },
  {
    id: 5,
    name: "Tangail",
    category: "Handloom",
    detail: "Classic handloom",
    quantity: 2,
    color: "#9A5D70",
    buyingPrice: 2350,
    sellingPrice: 3200,
    additions: [
      {
        id: 105,
        date: "08 May 2025",
        quantity: 5,
        supplier: "Tangail Tant Ghar",
        totalCost: 12000,
      },
    ],
  },
  {
    id: 6,
    name: "Muslin",
    category: "Fine Weave",
    detail: "Fine weave · Lightweight",
    quantity: 3,
    color: "#70878A",
    buyingPrice: 3200,
    sellingPrice: 4200,
    additions: [
      {
        id: 106,
        date: "10 May 2025",
        quantity: 3,
        supplier: "Sonargaon Textiles",
        totalCost: 9750,
      },
    ],
  },
];

const sampleSaleCreators = [
  { employeeId: "EMP-001", employeeName: "Priya Das" },
  { employeeId: "EMP-002", employeeName: "Riya Sen" },
  { employeeId: "EMP-003", employeeName: "Anika Roy" },
  { employeeId: "EMP-004", employeeName: "Maya Dutta" },
];
const sampleSaleTimes = [
  "9:15 AM",
  "9:40 AM",
  "10:15 AM",
  "11:40 AM",
  "12:15 PM",
  "1:40 PM",
  "2:15 PM",
  "3:40 PM",
  "4:15 PM",
  "5:40 PM",
];

const initialSalesBase: Omit<
  SaleRecord,
  "employeeId" | "employeeName" | "time" | "transactionType"
>[] = [
  {
    id: 1001,
    invoiceId: "INV-250524-001",
    date: "24 May 2025",
    customer: "Nusrat Jahan",
    source: "Store Sale",
    items: [{ id: 1, product: "Jamdani", quantity: 1, price: 4800 }],
    total: 4800,
    paid: 2400,
    due: 2400,
    advanceUsed: 0,
    customerAdvance: 0,
    changeReturned: 0,
    method: "bKash",
  },
  {
    id: 1002,
    invoiceId: "INV-250524-002",
    date: "24 May 2025",
    customer: "Shahana Akter",
    source: "Store Sale",
    items: [{ id: 2, product: "Manipuri", quantity: 1, price: 3650 }],
    total: 3650,
    paid: 1700,
    due: 1950,
    advanceUsed: 0,
    customerAdvance: 0,
    changeReturned: 0,
    method: "Cash",
  },
  {
    id: 1003,
    invoiceId: "INV-250524-003",
    date: "24 May 2025",
    customer: "Rumana Chowdhury",
    source: "Store Sale",
    items: [{ id: 3, product: "Cotton", quantity: 1, price: 2750 }],
    total: 2750,
    paid: 1000,
    due: 1750,
    advanceUsed: 0,
    customerAdvance: 0,
    changeReturned: 0,
    method: "Cash",
  },
  {
    id: 1004,
    invoiceId: "INV-250524-004",
    date: "24 May 2025",
    customer: "Walk-in customer",
    source: "Store Sale",
    items: [{ id: 4, product: "Cotton", quantity: 1, price: 2400 }],
    total: 2400,
    paid: 2400,
    due: 0,
    advanceUsed: 0,
    customerAdvance: 0,
    changeReturned: 0,
    method: "Cash",
  },
  {
    id: 1005,
    invoiceId: "INV-250524-005",
    date: "24 May 2025",
    customer: "Walk-in customer",
    source: "Store Sale",
    items: [{ id: 5, product: "Cotton", quantity: 1, price: 2100 }],
    total: 2100,
    paid: 2100,
    due: 0,
    advanceUsed: 0,
    customerAdvance: 0,
    changeReturned: 0,
    method: "Nagad",
  },
  {
    id: 1006,
    invoiceId: "INV-250524-006",
    date: "24 May 2025",
    customer: "Walk-in customer",
    source: "Store Sale",
    items: [{ id: 6, product: "Cotton", quantity: 1, price: 1900 }],
    total: 1900,
    paid: 1900,
    due: 0,
    advanceUsed: 0,
    customerAdvance: 0,
    changeReturned: 0,
    method: "Cash",
  },
  {
    id: 1007,
    invoiceId: "INV-250524-007",
    date: "24 May 2025",
    customer: "Walk-in customer",
    source: "Store Sale",
    items: [{ id: 7, product: "Cotton", quantity: 1, price: 1850 }],
    total: 1850,
    paid: 1850,
    due: 0,
    advanceUsed: 0,
    customerAdvance: 0,
    changeReturned: 0,
    method: "Cash",
  },
  {
    id: 1008,
    invoiceId: "INV-250524-008",
    date: "24 May 2025",
    customer: "Nabil Islam",
    source: "Home Sale",
    items: [{ id: 8, product: "Muslin", quantity: 1, price: 4200 }],
    total: 4200,
    paid: 4700,
    due: 0,
    advanceUsed: 0,
    customerAdvance: 500,
    changeReturned: 0,
    method: "bKash",
  },
  {
    id: 1009,
    invoiceId: "INV-250524-009",
    date: "24 May 2025",
    customer: "Maliha Karim",
    source: "Home Sale",
    items: [{ id: 9, product: "Tangail", quantity: 1, price: 3200 }],
    total: 3200,
    paid: 4400,
    due: 0,
    advanceUsed: 0,
    customerAdvance: 1200,
    changeReturned: 0,
    method: "Cash",
  },
  {
    id: 1010,
    invoiceId: "INV-250524-010",
    date: "24 May 2025",
    customer: "Walk-in customer",
    source: "Home Sale",
    items: [{ id: 10, product: "Cotton", quantity: 1, price: 1800 }],
    total: 1800,
    paid: 1800,
    due: 0,
    advanceUsed: 0,
    customerAdvance: 0,
    changeReturned: 0,
    method: "Bank Transfer",
  },
];

const initialSales: SaleRecord[] = initialSalesBase.map((sale, index) => {
  const employee = sampleSaleCreators[index % sampleSaleCreators.length];
  return {
    ...sale,
    employeeId: employee.employeeId,
    employeeName: employee.employeeName,
    time: sampleSaleTimes[index],
    transactionType: "Sale",
  };
});

const initialBackups: BackupRecord[] = [
  { id: 1, date: "24 May 2025", time: "09:30 PM", type: "Automatic backup" },
  { id: 2, date: "17 May 2025", time: "09:30 PM", type: "Automatic backup" },
  { id: 3, date: "10 May 2025", time: "06:15 PM", type: "Manual backup" },
];

const initialEmployees: Employee[] = [
  {
    id: 1,
    employeeId: "EMP-001",
    name: "Priya Das",
    role: "Sales Associate",
    phone: "01715 440 281",
    joiningDate: "12 January 2023",
    daysWorked: 24,
    hoursWorked: 192,
    salary: 18000,
    overtime: 1200,
    advance: 2000,
    paid: 10000,
  },
  {
    id: 2,
    employeeId: "EMP-002",
    name: "Riya Sen",
    role: "Inventory Assistant",
    phone: "01844 721 305",
    joiningDate: "08 July 2022",
    daysWorked: 22,
    hoursWorked: 176,
    salary: 16000,
    overtime: 800,
    advance: 0,
    paid: 16800,
  },
  {
    id: 3,
    employeeId: "EMP-003",
    name: "Anika Roy",
    role: "Boutique Assistant",
    phone: "01628 551 702",
    joiningDate: "20 March 2024",
    daysWorked: 20,
    hoursWorked: 160,
    salary: 15000,
    overtime: 0,
    advance: 1500,
    paid: 0,
  },
  {
    id: 4,
    employeeId: "EMP-004",
    name: "Maya Dutta",
    role: "Delivery & Home Sales",
    phone: "01936 820 149",
    joiningDate: "15 September 2023",
    daysWorked: 18,
    hoursWorked: 148,
    salary: 14000,
    overtime: 1600,
    advance: 0,
    paid: 0,
  },
];

const initialAttendance: AttendanceSession[] = [
  {
    id: 1,
    employeeId: "EMP-001",
    employeeName: "Priya Das",
    date: "23 May 2025",
    clockIn: "9:02 AM",
    clockOut: "5:08 PM",
    clockInTimestamp: Date.UTC(2025, 4, 23, 9, 2),
    clockOutTimestamp: Date.UTC(2025, 4, 23, 17, 8),
    minutes: 486,
  },
  {
    id: 2,
    employeeId: "EMP-002",
    employeeName: "Riya Sen",
    date: "23 May 2025",
    clockIn: "8:55 AM",
    clockOut: "4:58 PM",
    clockInTimestamp: Date.UTC(2025, 4, 23, 8, 55),
    clockOutTimestamp: Date.UTC(2025, 4, 23, 16, 58),
    minutes: 483,
  },
  {
    id: 3,
    employeeId: "EMP-003",
    employeeName: "Anika Roy",
    date: "22 May 2025",
    clockIn: "9:10 AM",
    clockOut: "5:02 PM",
    clockInTimestamp: Date.UTC(2025, 4, 22, 9, 10),
    clockOutTimestamp: Date.UTC(2025, 4, 22, 17, 2),
    minutes: 472,
  },
];

const money = (value: number) => `BDT ${value.toLocaleString("en-BD")}`;
const displayDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
const formatMinutes = (minutes: number) =>
  `${Math.floor(minutes / 60)}h ${Math.max(Math.floor(minutes % 60), 0)}m`;
const formatTime = (value: Date) =>
  value.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
const localDateKey = (value: Date) =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(
    value.getDate(),
  ).padStart(2, "0")}`;

function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: (
      <>
        <path d="m15 18-6-6 6-6" />
        <path d="M9 12h10" />
      </>
    ),
    bag: (
      <>
        <path d="M6 8h12l-1 11H7L6 8Z" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
      </>
    ),
    box: (
      <>
        <path d="m4 7 8-4 8 4-8 4-8-4Z" />
        <path d="m4 7 8 4 8-4v10l-8 4-8-4V7Z" />
        <path d="M12 11v10" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    card: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18M7 15h3" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
    database: (
      <>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
      </>
    ),
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10M9 20v-6h6v6" />
      </>
    ),
    invoice: (
      <>
        <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
        <path d="M9 8h6M9 12h6M9 16h3" />
      </>
    ),
    menu: (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 5 6v5c0 4.6 2.8 8.2 7 10 4.2-1.8 7-5.4 7-10V6l-7-3Z" />
        <path d="m9 12 2 2 4-5" />
      </>
    ),
    store: (
      <>
        <path d="M4 10v10h16V10M3 10l2-6h14l2 6" />
        <path d="M8 20v-6h8v6M3 10a3 3 0 0 0 5 0 4 4 0 0 0 8 0 3 3 0 0 0 5 0" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5" />
      </>
    ),
    wallet: (
      <>
        <path d="M4 6h14a2 2 0 0 1 2 2v11H5a2 2 0 0 1-2-2V6a3 3 0 0 1 3-3h11v3" />
        <path d="M15 12h6v4h-6a2 2 0 0 1 0-4Z" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function Header({
  title,
  subtitle,
  onBack,
  onHome,
  onMenu,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onHome?: () => void;
  onMenu?: () => void;
}) {
  return (
    <header className="page-header">
      {onBack && (
        <button className="icon-button" onClick={onBack} aria-label="Go back">
          <Icon name="arrow" />
        </button>
      )}
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {onHome && (
        <button className="icon-button header-home" onClick={onHome} aria-label="Back to Dashboard">
          <Icon name="home" size={19} />
        </button>
      )}
      {onMenu && (
        <button className="icon-button header-menu" onClick={onMenu} aria-label="Open navigation">
          <Icon name="menu" size={20} />
        </button>
      )}
    </header>
  );
}

function Progress({ step }: { step: number }) {
  return (
    <div className="progress" aria-label={`Step ${step} of 4`}>
      {[1, 2, 3, 4].map((number) => (
        <span key={number} className={number <= step ? "active" : ""} />
      ))}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sales, setSales] = useState(initialSales);
  const [duePaymentRecords, setDuePaymentRecords] = useState<DuePaymentRecord[]>([]);
  const [lastDuePayment, setLastDuePayment] = useState<DuePaymentRecord | null>(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
  const [transactionSearch, setTransactionSearch] = useState("");
  const [transactionEmployeeFilter, setTransactionEmployeeFilter] = useState("All");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedDirectoryCustomerId, setSelectedDirectoryCustomerId] = useState<number | null>(
    null,
  );
  const [backups, setBackups] = useState(initialBackups);
  const [accessMode, setAccessMode] = useState<"Owner" | "Employee">("Owner");
  const [protectedTarget, setProtectedTarget] = useState<ProtectedSection | "owner-mode" | null>(
    null,
  );
  const [ownerPassword, setOwnerPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [unlockedSection, setUnlockedSection] = useState<ProtectedSection | null>(null);
  const [employeePermissions, setEmployeePermissions] = useState<
    Record<
      number,
      {
        sales: boolean;
        customers: boolean;
        stockCosts: boolean;
        dueCollection: boolean;
      }
    >
  >(() =>
    Object.fromEntries(
      initialEmployees.map((employee) => [
        employee.id,
        {
          sales: true,
          customers: employee.id !== 4,
          stockCosts: employee.id === 1,
          dueCollection: employee.id === 1 || employee.id === 2,
        },
      ]),
    ),
  );
  const [profitPeriod, setProfitPeriod] = useState<"May 2025" | "All time">("May 2025");
  const [invoiceId, setInvoiceId] = useState("INV-250524-011");
  const [date, setDate] = useState("2025-05-24");
  const [customer, setCustomer] = useState("");
  const [source, setSource] = useState<SaleSource>("Store Sale");
  const [items, setItems] = useState<SaleItem[]>([]);
  const [paid, setPaid] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("Cash");
  const [excessOption, setExcessOption] = useState<"" | "return" | "advance">("");
  const [advanceToApply, setAdvanceToApply] = useState("");
  const [error, setError] = useState("");
  const [dueCustomers, setDueCustomers] = useState(initialDueCustomers);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [dueSearch, setDueSearch] = useState("");
  const [duePayment, setDuePayment] = useState("");
  const [duePaymentMethod, setDuePaymentMethod] = useState<DuePaymentMethod | "">("");
  const [dueExcessOption, setDueExcessOption] = useState<"" | "return" | "advance">("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [advanceSearch, setAdvanceSearch] = useState("");
  const [selectedAdvanceCustomerId, setSelectedAdvanceCustomerId] = useState<number | null>(null);
  const [inventoryProducts, setInventoryProducts] = useState(initialStockProducts);
  const [stockSearch, setStockSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<"All" | "Low Stock">("All");
  const [selectedStockId, setSelectedStockId] = useState<number | null>(null);
  const [stockEntryError, setStockEntryError] = useState("");
  const [stockEntry, setStockEntry] = useState<StockEntryForm>({
    mode: "existing",
    productId: "1",
    name: "Jamdani",
    category: "Handwoven",
    quantity: "",
    buyingPrice: "3600",
    sellingPrice: "4800",
    supplier: "",
    date: "2025-05-24",
    additionalCost: "",
    notes: "",
  });
  const [employees, setEmployees] = useState(initialEmployees);
  const [loggedEmployeeId, setLoggedEmployeeId] = useState("EMP-001");
  const [clockEmployeeId, setClockEmployeeId] = useState("EMP-001");
  const [attendance, setAttendance] = useState(initialAttendance);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [completedWorkMinutes, setCompletedWorkMinutes] = useState<number | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [employeeAction, setEmployeeAction] = useState<"attendance" | "hours" | "salary" | null>(
    null,
  );
  const [employeeEntry, setEmployeeEntry] = useState("");
  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.price, 0),
    [items],
  );
  const paidAmount = Math.max(Number(paid) || 0, 0);
  const customerAccount = dueCustomers.find(
    (entry) =>
      Boolean(customer.trim()) && entry.name.toLowerCase() === customer.trim().toLowerCase(),
  );
  const availableAdvance = customerAccount?.advance ?? 0;
  const maximumAdvanceUse = Math.min(availableAdvance, Math.max(total - paidAmount, 0));
  const appliedAdvance = Math.min(Math.max(Number(advanceToApply) || 0, 0), maximumAdvanceUse);
  const due = Math.max(total - paidAmount - appliedAdvance, 0);
  const excessAmount = Math.max(paidAmount - total, 0);
  const totalCustomerDue = dueCustomers.reduce((sum, entry) => sum + entry.due, 0);
  const totalCustomerAdvance = dueCustomers.reduce((sum, entry) => sum + (entry.advance ?? 0), 0);
  const advanceCustomers = dueCustomers.filter((entry) => (entry.advance ?? 0) > 0);
  const filteredAdvanceCustomers = advanceCustomers.filter((entry) =>
    `${entry.name} ${entry.phone}`.toLowerCase().includes(advanceSearch.toLowerCase()),
  );
  const selectedAdvanceCustomer = dueCustomers.find(
    (entry) => entry.id === selectedAdvanceCustomerId,
  );
  const activeDueCustomers = dueCustomers.filter((entry) => entry.due > 0);
  const selectedDueCustomer = dueCustomers.find((entry) => entry.id === selectedCustomerId);
  const filteredDueCustomers = activeDueCustomers.filter((entry) =>
    `${entry.name} ${entry.phone}`.toLowerCase().includes(dueSearch.toLowerCase()),
  );
  const duePaymentAmount = Math.max(Number(duePayment) || 0, 0);
  const duePaymentApplied = Math.min(duePaymentAmount, selectedDueCustomer?.due ?? 0);
  const duePaymentExcess = Math.max(
    duePaymentAmount - (selectedDueCustomer?.due ?? duePaymentAmount),
    0,
  );
  const filteredStock = inventoryProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(stockSearch.toLowerCase()) &&
      (stockFilter === "All" || product.quantity <= 3),
  );
  const selectedStock = inventoryProducts.find((product) => product.id === selectedStockId);
  const lowStockPieces = inventoryProducts
    .filter((product) => product.quantity <= 3)
    .reduce((sum, product) => sum + product.quantity, 0);
  const stockPurchaseSubtotal =
    (Number(stockEntry.quantity) || 0) * (Number(stockEntry.buyingPrice) || 0);
  const stockPurchaseTotal = stockPurchaseSubtotal + (Number(stockEntry.additionalCost) || 0);
  const selectedEmployee = employees.find((employee) => employee.id === selectedEmployeeId);
  const totalStaffHours = employees.reduce((sum, employee) => sum + employee.hoursWorked, 0);
  const estimatedPayroll = employees.reduce(
    (sum, employee) => sum + employee.salary + employee.overtime,
    0,
  );
  const selectedTransaction = sales.find((sale) => sale.id === selectedTransactionId);
  const currentEmployee =
    employees.find((employee) => employee.employeeId === loggedEmployeeId) ?? employees[0];
  const activeClockSession = attendance.find(
    (session) => session.employeeId === loggedEmployeeId && !session.clockOutTimestamp,
  );
  const currentActor =
    accessMode === "Owner"
      ? { employeeId: "OWNER", employeeName: "Owner / Admin" }
      : { employeeId: currentEmployee.employeeId, employeeName: currentEmployee.name };
  const canViewStockCosts =
    accessMode === "Owner" || employeePermissions[currentEmployee.id].stockCosts;
  const visibleSales = sales.filter((sale) => {
    if (accessMode === "Employee") return sale.employeeId === loggedEmployeeId;
    return transactionEmployeeFilter === "All" || sale.employeeId === transactionEmployeeFilter;
  });
  const filteredTransactions = visibleSales.filter((sale) =>
    `${sale.customer} ${sale.invoiceId} ${sale.source} ${sale.method} ${sale.employeeName} ${sale.employeeId}`
      .toLowerCase()
      .includes(transactionSearch.toLowerCase()),
  );
  const stockTransactions = inventoryProducts.flatMap((product) =>
    product.additions.map((addition) => ({
      ...addition,
      productId: product.id,
      productName: product.name,
      employeeId: addition.employeeId ?? "OWNER",
      employeeName: addition.employeeName ?? "Owner / Admin",
      time: addition.time ?? "—",
      reference: addition.reference ?? `STK-${addition.id}`,
    })),
  );
  const visibleStockTransactions = stockTransactions.filter((entry) => {
    const belongsToCurrentEmployee =
      accessMode === "Employee" ? entry.employeeId === loggedEmployeeId : true;
    const matchesOwnerFilter =
      accessMode === "Owner"
        ? transactionEmployeeFilter === "All" || entry.employeeId === transactionEmployeeFilter
        : true;
    return (
      belongsToCurrentEmployee &&
      matchesOwnerFilter &&
      `${entry.productName} ${entry.reference} ${entry.employeeName}`
        .toLowerCase()
        .includes(transactionSearch.toLowerCase())
    );
  });
  const visibleDuePayments = duePaymentRecords.filter((entry) => {
    const belongsToCurrentEmployee =
      accessMode === "Employee" ? entry.employeeId === loggedEmployeeId : true;
    const matchesOwnerFilter =
      accessMode === "Owner"
        ? transactionEmployeeFilter === "All" || entry.employeeId === transactionEmployeeFilter
        : true;
    return (
      belongsToCurrentEmployee &&
      matchesOwnerFilter &&
      `${entry.customerName} ${entry.customerId} ${entry.reference} ${entry.method}`
        .toLowerCase()
        .includes(transactionSearch.toLowerCase())
    );
  });
  const visibleDuePaymentTotal = visibleDuePayments.reduce(
    (sum, entry) => sum + entry.amountReceived - entry.changeReturned,
    0,
  );
  const visibleSalesRevenue = visibleSales.reduce((sum, sale) => sum + sale.total, 0);
  const visibleMoneyReceived = visibleSales.reduce(
    (sum, sale) => sum + Math.max(sale.paid - sale.changeReturned, 0),
    0,
  );
  const visibleStoreSales = visibleSales
    .filter((sale) => sale.source === "Store Sale")
    .reduce((sum, sale) => sum + sale.total, 0);
  const visibleHomeSales = visibleSales
    .filter((sale) => sale.source === "Home Sale")
    .reduce((sum, sale) => sum + sale.total, 0);
  const hour = currentTime.getHours();
  const greeting =
    hour >= 5 && hour < 12
      ? "Good morning"
      : hour >= 12 && hour < 17
        ? "Good afternoon"
        : "Good evening";
  const greetingName = accessMode === "Owner" ? "Mukti" : currentEmployee.name.split(" ")[0];
  const activeWorkMinutes = activeClockSession
    ? Math.max((currentTime.getTime() - activeClockSession.clockInTimestamp) / 60000, 0)
    : 0;
  const employeeAttendance = attendance.filter(
    (session) => session.employeeId === loggedEmployeeId,
  );
  const todayLabel = displayDate(localDateKey(currentTime));
  const todayWorkMinutes = employeeAttendance
    .filter((session) => session.date === todayLabel)
    .reduce(
      (sum, session) =>
        sum +
        (session.clockOutTimestamp
          ? session.minutes
          : Math.max((currentTime.getTime() - session.clockInTimestamp) / 60000, 0)),
      0,
    );
  const filteredDirectoryCustomers = dueCustomers.filter((entry) =>
    `${entry.name} ${entry.phone}`.toLowerCase().includes(customerSearch.toLowerCase()),
  );
  const selectedDirectoryCustomer = dueCustomers.find(
    (entry) => entry.id === selectedDirectoryCustomerId,
  );
  const salesRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const moneyReceived =
    sales.reduce((sum, sale) => sum + Math.max(sale.paid - sale.changeReturned, 0), 0) +
    duePaymentRecords.reduce(
      (sum, payment) => sum + payment.amountReceived - payment.changeReturned,
      0,
    );
  const storeSalesTotal = sales
    .filter((sale) => sale.source === "Store Sale")
    .reduce((sum, sale) => sum + sale.total, 0);
  const homeSalesTotal = sales
    .filter((sale) => sale.source === "Home Sale")
    .reduce((sum, sale) => sum + sale.total, 0);
  const storeSalesCount = sales.filter((sale) => sale.source === "Store Sale").length;
  const homeSalesCount = sales.filter((sale) => sale.source === "Home Sale").length;
  const payrollCosts = employees.reduce(
    (sum, employee) => sum + employee.salary + employee.overtime,
    0,
  );
  const reportingSales =
    profitPeriod === "May 2025" ? sales.filter((sale) => sale.date.includes("May 2025")) : sales;
  const reportingRevenue = reportingSales.reduce((sum, sale) => sum + sale.total, 0);
  const reportingProductCost = reportingSales.reduce(
    (sum, sale) =>
      sum +
      sale.items.reduce((itemTotal, item) => {
        const product = inventoryProducts.find((entry) => entry.name === item.product);
        return itemTotal + (product?.buyingPrice ?? 0) * item.quantity;
      }, 0),
    0,
  );
  const reportingPurchaseCosts = inventoryProducts.reduce(
    (sum, product) =>
      sum +
      product.additions
        .filter((addition) => profitPeriod === "All time" || addition.date.includes("May 2025"))
        .reduce((total, addition) => total + addition.totalCost, 0),
    0,
  );
  const reportingAdditionalExpenses = inventoryProducts.reduce(
    (sum, product) =>
      sum +
      product.additions
        .filter((addition) => profitPeriod === "All time" || addition.date.includes("May 2025"))
        .reduce(
          (total, addition) =>
            total + Math.max(addition.totalCost - addition.quantity * product.buyingPrice, 0),
          0,
        ),
    0,
  );
  const reportingGrossProfit = reportingRevenue - reportingProductCost;
  const reportingNetProfit = reportingGrossProfit - reportingAdditionalExpenses - payrollCosts;
  const reportingStoreSales = reportingSales
    .filter((sale) => sale.source === "Store Sale")
    .reduce((sum, sale) => sum + sale.total, 0);
  const reportingHomeSales = reportingSales
    .filter((sale) => sale.source === "Home Sale")
    .reduce((sum, sale) => sum + sale.total, 0);

  const requestOwnerPassword = (target: ProtectedSection | "owner-mode") => {
    setProtectedTarget(target);
    setOwnerPassword("");
    setPasswordError("");
  };

  const verifyOwnerPassword = () => {
    if (ownerPassword !== "1234" || !protectedTarget) {
      setPasswordError("Incorrect password");
      return;
    }
    if (protectedTarget === "owner-mode") {
      setAccessMode("Owner");
      setUnlockedSection(null);
    } else {
      setUnlockedSection(protectedTarget);
      if (protectedTarget === "new-sale") newSale();
      else setScreen(protectedTarget);
    }
    setProtectedTarget(null);
    setOwnerPassword("");
    setPasswordError("");
  };

  const openSection = (section: string) => {
    setDrawerOpen(false);
    const protectedSections: ProtectedSection[] = [
      "customers",
      "dues",
      "advances",
      "profit",
      "staff",
      "backups",
      "access",
    ];
    const currentPermissions = employeePermissions[currentEmployee.id];
    const saleRestricted =
      accessMode === "Employee" && section === "new-sale" && !currentPermissions.sales;
    const protectedForEmployee =
      accessMode === "Employee" &&
      protectedSections.includes(section as ProtectedSection) &&
      !(section === "dues" && currentPermissions.dueCollection);
    if (protectedForEmployee || saleRestricted) {
      requestOwnerPassword(section as ProtectedSection);
      return;
    }
    setUnlockedSection(null);
    if (section === "overview") setScreen("dashboard");
    if (section === "new-sale") newSale();
    if (section === "inventory") setScreen("stock");
    if (section === "transactions") setScreen("transactions");
    if (section === "customers") setScreen("customers");
    if (section === "dues") setScreen("dues");
    if (section === "advances") setScreen("advances");
    if (section === "staff") setScreen("staff");
    if (section === "profit") setScreen("profit");
    if (section === "backups") setScreen("backups");
    if (section === "access") setScreen("access");
    if (section === "stock-entry") startStockEntry();
    if (section === "my-attendance") setScreen("my-attendance");
    if (section === "clock") {
      setCompletedWorkMinutes(null);
      setScreen("clock");
    }
  };

  const leaveProtectedSection = () => {
    setUnlockedSection(null);
    setScreen("dashboard");
  };

  const updateEmployeePermission = (
    employeeId: number,
    permission: "sales" | "customers" | "stockCosts" | "dueCollection",
  ) => {
    setEmployeePermissions((current) => ({
      ...current,
      [employeeId]: {
        ...current[employeeId],
        [permission]: !current[employeeId][permission],
      },
    }));
  };

  const isSectionActive = (section: string) => {
    if (section === "overview") return screen === "dashboard";
    if (section === "new-sale")
      return ["new-sale", "items", "payment", "confirmation"].includes(screen);
    if (section === "inventory")
      return accessMode === "Employee"
        ? ["stock", "stock-detail"].includes(screen)
        : ["stock", "stock-detail", "add-stock"].includes(screen);
    if (section === "stock-entry") return screen === "add-stock";
    if (section === "transactions") return ["transactions", "transaction-detail"].includes(screen);
    if (section === "customers") return ["customers", "customer-detail"].includes(screen);
    if (section === "dues")
      return ["dues", "due-detail", "due-payment-confirmation"].includes(screen);
    if (section === "advances") return ["advances", "advance-detail"].includes(screen);
    if (section === "staff") return ["staff", "employee-detail"].includes(screen);
    if (section === "my-attendance") return screen === "my-attendance";
    if (section === "clock") return screen === "clock";
    return screen === section;
  };

  const createBackup = () => {
    const now = new Date();
    setBackups((current) => [
      {
        id: now.getTime(),
        date: displayDate(localDateKey(now)),
        time: now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        type: "Manual backup",
      },
      ...current,
    ]);
  };

  const exportBusinessData = () => {
    const businessData = {
      exportedAt: new Date().toISOString(),
      sales,
      customers: dueCustomers,
      inventory: inventoryProducts,
      employees,
    };
    const file = new Blob([JSON.stringify(businessData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mukti-saree-business-data.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const newSale = () => {
    const saleDate = new Date().toISOString().slice(0, 10);
    setDate(saleDate);
    setInvoiceId(
      `INV-${saleDate.slice(2).replaceAll("-", "")}-${String(sales.length + 1).padStart(3, "0")}`,
    );
    setCustomer("");
    setSource("Store Sale");
    setItems([]);
    setPaid("");
    setMethod("Cash");
    setExcessOption("");
    setAdvanceToApply("");
    setError("");
    setScreen("new-sale");
  };

  const addProduct = (productName = "Jamdani") => {
    const product =
      inventoryProducts.find((entry) => entry.name === productName) ?? inventoryProducts[0];
    setItems((current) => [
      ...current,
      {
        id: Date.now() + current.length,
        product: product.name,
        quantity: 1,
        price: product.sellingPrice,
      },
    ]);
  };

  const updateItem = (id: number, patch: Partial<SaleItem>) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const startItems = () => {
    if (items.length === 0) addProduct();
    setScreen("items");
  };

  const continueToPayment = () => {
    if (!items.length) return;
    setPaid(String(total));
    setExcessOption("");
    setAdvanceToApply("");
    setError("");
    setScreen("payment");
  };

  const confirmSale = () => {
    if (excessAmount > 0 && !excessOption) {
      setError("Choose how to handle the excess amount.");
      return;
    }

    const customerRequired = due > 0 || appliedAdvance > 0 || excessOption === "advance";
    if (customerRequired && !customer.trim()) {
      setError(
        excessOption === "advance"
          ? "Customer name is required to save an advance."
          : "Customer name is required when there is a due.",
      );
      return;
    }

    const advanceAdded = excessOption === "advance" ? excessAmount : 0;
    const shouldUpdateAccount = Boolean(customer.trim());

    if (shouldUpdateAccount) {
      const customerName = customer.trim();
      const saleDate = displayDate(date);
      const itemSummary = items.map((item) => `${item.product} × ${item.quantity}`).join(", ");
      const timestamp = Date.now();
      const saleHistory: DueEvent[] = [
        {
          id: timestamp,
          type: "Purchase",
          date: saleDate,
          detail: `${itemSummary} · ${invoiceId}`,
          amount: total,
        },
      ];

      if (paidAmount > 0) {
        saleHistory.push({
          id: timestamp + 1,
          type: "Payment",
          date: saleDate,
          detail: `${method} payment · ${invoiceId}`,
          amount: paidAmount,
          method,
        });
      }

      setDueCustomers((current) => {
        const existingCustomer = current.find(
          (entry) => entry.name.toLowerCase() === customerName.toLowerCase(),
        );

        if (existingCustomer) {
          return current.map((entry) =>
            entry.id === existingCustomer.id
              ? (() => {
                  const currentAdvance = entry.advance ?? 0;
                  const balanceAfterUse = Math.max(currentAdvance - appliedAdvance, 0);
                  const nextAdvance = balanceAfterUse + advanceAdded;
                  const advanceTransactions: AdvanceTransaction[] = [];

                  if (appliedAdvance > 0) {
                    advanceTransactions.push({
                      id: timestamp + 2,
                      date: saleDate,
                      amountAdded: 0,
                      amountUsed: appliedAdvance,
                      source: `Applied to purchase · ${invoiceId}`,
                      method,
                      remainingBalance: balanceAfterUse,
                    });
                  }
                  if (advanceAdded > 0) {
                    advanceTransactions.push({
                      id: timestamp + 3,
                      date: saleDate,
                      amountAdded: advanceAdded,
                      amountUsed: 0,
                      source: `Sale overpayment · ${invoiceId}`,
                      method,
                      remainingBalance: nextAdvance,
                    });
                  }

                  return {
                    ...entry,
                    due: entry.due + due,
                    advance: nextAdvance,
                    lastPurchase: saleDate,
                    history: [...saleHistory, ...entry.history],
                    advanceHistory: [
                      ...advanceTransactions.reverse(),
                      ...(entry.advanceHistory ?? []),
                    ],
                  };
                })()
              : entry,
          );
        }

        return [
          {
            id: timestamp,
            name: customerName,
            phone: "Not provided",
            due,
            advance: advanceAdded,
            lastPurchase: saleDate,
            history: saleHistory,
            advanceHistory:
              advanceAdded > 0
                ? [
                    {
                      id: timestamp + 2,
                      date: saleDate,
                      amountAdded: advanceAdded,
                      amountUsed: 0,
                      source: `Sale overpayment · ${invoiceId}`,
                      method,
                      remainingBalance: advanceAdded,
                    },
                  ]
                : [],
          },
          ...current,
        ];
      });
    }

    const transactionId = Date.now();
    setSales((current) => [
      {
        id: transactionId,
        invoiceId,
        date: displayDate(date),
        customer: customer.trim() || "Walk-in customer",
        source,
        items: items.map((item) => ({ ...item })),
        total,
        paid: paidAmount,
        due,
        advanceUsed: appliedAdvance,
        customerAdvance: advanceAdded,
        changeReturned: excessOption === "return" ? excessAmount : 0,
        method,
        employeeId: currentActor.employeeId,
        employeeName: currentActor.employeeName,
        time: formatTime(new Date()),
        transactionType: "Sale",
      },
      ...current,
    ]);
    setInventoryProducts((current) =>
      current.map((product) => {
        const soldQuantity = items
          .filter((item) => item.product === product.name)
          .reduce((sum, item) => sum + item.quantity, 0);
        return soldQuantity > 0
          ? { ...product, quantity: Math.max(product.quantity - soldQuantity, 0) }
          : product;
      }),
    );
    setError("");
    setScreen("confirmation");
  };

  const openDueCustomer = (id: number) => {
    setSelectedCustomerId(id);
    setDuePayment("");
    setDuePaymentMethod("");
    setDueExcessOption("");
    setShowPaymentForm(false);
    setScreen("due-detail");
  };

  const recordDuePayment = () => {
    if (!selectedDueCustomer || !duePaymentMethod) return;
    if (duePaymentAmount <= 0 || (duePaymentExcess > 0 && !dueExcessOption)) return;
    const advanceCreated = dueExcessOption === "advance" ? duePaymentExcess : 0;
    const changeReturned = dueExcessOption === "return" ? duePaymentExcess : 0;
    const paymentDate = displayDate(localDateKey(new Date()));
    const paymentTimestamp = Date.now();
    const paymentRecord: DuePaymentRecord = {
      id: paymentTimestamp,
      reference: `PAY-${String(paymentTimestamp).slice(-6)}`,
      customerId: `CUS-${String(selectedDueCustomer.id).padStart(3, "0")}`,
      customerName: selectedDueCustomer.name,
      amountReceived: duePaymentAmount,
      method: duePaymentMethod,
      date: paymentDate,
      time: formatTime(new Date()),
      employeeName: currentActor.employeeName,
      employeeId: currentActor.employeeId,
      previousDue: selectedDueCustomer.due,
      remainingDue: Math.max(selectedDueCustomer.due - duePaymentApplied, 0),
      changeReturned,
      advanceCreated,
    };
    setDueCustomers((current) =>
      current.map((entry) =>
        entry.id === selectedDueCustomer.id
          ? {
              ...entry,
              due: Math.max(entry.due - duePaymentApplied, 0),
              advance: (entry.advance ?? 0) + advanceCreated,
              advanceHistory:
                advanceCreated > 0
                  ? [
                      {
                        id: paymentTimestamp + 1,
                        date: paymentDate,
                        amountAdded: advanceCreated,
                        amountUsed: 0,
                        source: "Due payment overpayment",
                        method: duePaymentMethod,
                        remainingBalance: (entry.advance ?? 0) + advanceCreated,
                      },
                      ...(entry.advanceHistory ?? []),
                    ]
                  : entry.advanceHistory,
              history: [
                {
                  id: paymentTimestamp,
                  type: "Payment",
                  date: paymentDate,
                  detail: "Payment received",
                  amount: duePaymentAmount,
                  method: duePaymentMethod,
                  appliedToDue: duePaymentApplied,
                  changeReturned,
                  advanceCreated,
                },
                ...entry.history,
              ],
            }
          : entry,
      ),
    );
    setDuePayment("");
    setDuePaymentMethod("");
    setDueExcessOption("");
    setShowPaymentForm(false);
    setDuePaymentRecords((current) => [paymentRecord, ...current]);
    setLastDuePayment(paymentRecord);
    setScreen("due-payment-confirmation");
  };

  const startStockEntry = () => {
    const firstProduct = inventoryProducts[0];
    setStockEntry({
      mode: "existing",
      productId: String(firstProduct.id),
      name: firstProduct.name,
      category: firstProduct.category,
      quantity: "",
      buyingPrice: String(firstProduct.buyingPrice),
      sellingPrice: String(firstProduct.sellingPrice),
      supplier: "",
      date: "2025-05-24",
      additionalCost: "",
      notes: "",
    });
    setStockEntryError("");
    setScreen("add-stock");
  };

  const selectStockProduct = (productId: string) => {
    const product = inventoryProducts.find((entry) => entry.id === Number(productId));
    if (!product) return;
    setStockEntry((current) => ({
      ...current,
      productId,
      name: product.name,
      category: product.category,
      buyingPrice: String(product.buyingPrice),
      sellingPrice: String(product.sellingPrice),
    }));
    setStockEntryError("");
  };

  const saveStockEntry = () => {
    const quantity = Number(stockEntry.quantity) || 0;
    const buyingPrice = Number(stockEntry.buyingPrice) || 0;
    const sellingPrice = Number(stockEntry.sellingPrice) || 0;
    const productName = stockEntry.name.trim();

    if (
      quantity <= 0 ||
      buyingPrice <= 0 ||
      sellingPrice <= 0 ||
      !stockEntry.supplier.trim() ||
      !stockEntry.date ||
      (stockEntry.mode === "new" && (!productName || !stockEntry.category.trim()))
    ) {
      setStockEntryError("Complete all required fields before saving.");
      return;
    }

    const timestamp = Date.now();
    const addition: StockAddition = {
      id: timestamp,
      date: displayDate(stockEntry.date),
      quantity,
      supplier: stockEntry.supplier.trim(),
      totalCost: stockPurchaseTotal,
      notes: stockEntry.notes.trim() || undefined,
      employeeId: currentActor.employeeId,
      employeeName: currentActor.employeeName,
      time: formatTime(new Date()),
      reference: `STK-${String(timestamp).slice(-6)}`,
      transactionType: "Stock Entry",
    };

    if (stockEntry.mode === "existing") {
      const productId = Number(stockEntry.productId);
      setInventoryProducts((current) =>
        current.map((product) =>
          product.id === productId
            ? {
                ...product,
                quantity: product.quantity + quantity,
                buyingPrice,
                sellingPrice,
                additions: [addition, ...product.additions],
              }
            : product,
        ),
      );
    } else {
      const duplicate = inventoryProducts.find(
        (product) => product.name.toLowerCase() === productName.toLowerCase(),
      );
      if (duplicate) {
        setStockEntryError("This product already exists. Select it from Existing product.");
        return;
      }
      setInventoryProducts((current) => [
        ...current,
        {
          id: timestamp,
          name: productName,
          category: stockEntry.category.trim(),
          detail: stockEntry.category.trim(),
          quantity,
          color: "#8B6A61",
          buyingPrice,
          sellingPrice,
          additions: [addition],
        },
      ]);
    }

    setStockEntryError("");
    setStockFilter("All");
    setStockSearch("");
    setScreen("stock");
  };

  const employeeRemaining = (employee: Employee) =>
    Math.max(employee.salary + employee.overtime - employee.advance - employee.paid, 0);

  const employeeStatus = (employee: Employee) => {
    if (employeeRemaining(employee) === 0) return "Paid";
    if (employee.paid + employee.advance > 0) return "Partially Paid";
    return "Unpaid";
  };

  const openEmployee = (id: number) => {
    setSelectedEmployeeId(id);
    setEmployeeAction(null);
    setEmployeeEntry("");
    setScreen("employee-detail");
  };

  const startEmployeeAction = (action: "attendance" | "hours" | "salary") => {
    setEmployeeAction(action);
    setEmployeeEntry("");
  };

  const saveEmployeeAction = () => {
    if (!selectedEmployee || !employeeAction) return;
    const amount = Number(employeeEntry) || 0;

    if (employeeAction !== "attendance" && amount <= 0) return;

    setEmployees((current) =>
      current.map((employee) => {
        if (employee.id !== selectedEmployee.id) return employee;
        if (employeeAction === "attendance") {
          return { ...employee, daysWorked: employee.daysWorked + 1 };
        }
        if (employeeAction === "hours") {
          return { ...employee, hoursWorked: employee.hoursWorked + amount };
        }
        return {
          ...employee,
          paid: employee.paid + Math.min(amount, employeeRemaining(employee)),
        };
      }),
    );
    setEmployeeAction(null);
    setEmployeeEntry("");
  };

  const clockIn = () => {
    const employee = employees.find((entry) => entry.employeeId === clockEmployeeId);
    if (!employee) return;
    const existingActiveSession = attendance.find(
      (session) => session.employeeId === employee.employeeId && !session.clockOutTimestamp,
    );
    if (existingActiveSession) {
      setLoggedEmployeeId(employee.employeeId);
      return;
    }
    const now = new Date();
    setLoggedEmployeeId(employee.employeeId);
    setAttendance((current) => [
      {
        id: now.getTime(),
        employeeId: employee.employeeId,
        employeeName: employee.name,
        date: displayDate(now.toISOString().slice(0, 10)),
        clockIn: formatTime(now),
        clockInTimestamp: now.getTime(),
        minutes: 0,
      },
      ...current,
    ]);
    setCompletedWorkMinutes(null);
  };

  const clockOut = () => {
    if (!activeClockSession) return;
    const now = new Date();
    const minutes = Math.max(
      Math.round((now.getTime() - activeClockSession.clockInTimestamp) / 60000),
      1,
    );
    const alreadyWorkedToday = attendance.some(
      (session) =>
        session.employeeId === loggedEmployeeId &&
        session.date === activeClockSession.date &&
        session.clockOutTimestamp,
    );
    setAttendance((current) =>
      current.map((session) =>
        session.id === activeClockSession.id
          ? {
              ...session,
              clockOut: formatTime(now),
              clockOutTimestamp: now.getTime(),
              minutes,
            }
          : session,
      ),
    );
    setEmployees((current) =>
      current.map((employee) =>
        employee.employeeId === loggedEmployeeId
          ? {
              ...employee,
              hoursWorked: Number((employee.hoursWorked + minutes / 60).toFixed(1)),
              daysWorked: employee.daysWorked + (alreadyWorkedToday ? 0 : 1),
            }
          : employee,
      ),
    );
    setCompletedWorkMinutes(minutes);
  };

  return (
    <main className="app-shell">
      <div className="textile-mark textile-mark-one" />
      <div className="textile-mark textile-mark-two" />
      <section className="phone">
        {screen === "dashboard" && (
          <div className="screen dashboard-screen">
            <header className="brand-header">
              <button
                className="icon-button dashboard-menu"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open navigation"
              >
                <Icon name="menu" size={20} />
              </button>
              <div>
                <p className="eyebrow">
                  {currentTime.toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <h1>
                  {greeting}, {greetingName}
                </h1>
              </div>
              <div className="brand-seal" aria-label="Mukti Saree Manager">
                M
              </div>
            </header>

            <section className="hero-card">
              <div className="hero-pattern" />
              <p>Today’s sales</p>
              <h2>{money(accessMode === "Owner" ? salesRevenue : visibleSalesRevenue)}</h2>
              <span>
                <b>{money(accessMode === "Owner" ? moneyReceived : visibleMoneyReceived)}</b> money
                received
              </span>
              <div className="saree-folds">
                <i />
                <i />
                <i />
              </div>
            </section>

            <div className="metric-grid">
              {accessMode === "Owner" ? (
                <>
                  <article className="metric-card">
                    <div className="metric-icon blush">
                      <Icon name="wallet" />
                    </div>
                    <p>Customer due</p>
                    <strong>{money(totalCustomerDue)}</strong>
                    <small>Across {activeDueCustomers.length} customers</small>
                    <small className="advance-summary">
                      Customer Advances: {money(totalCustomerAdvance)}
                    </small>
                  </article>
                  <article className="metric-card">
                    <div className="metric-icon sage">
                      <Icon name="box" />
                    </div>
                    <p>Low stock</p>
                    <strong>
                      {lowStockPieces} <em>items</em>
                    </strong>
                    <small>Needs attention</small>
                  </article>
                </>
              ) : (
                <>
                  <article className="metric-card">
                    <div className="metric-icon blush">
                      <Icon name="clock" />
                    </div>
                    <p>Today’s work</p>
                    <strong>{formatMinutes(todayWorkMinutes)}</strong>
                    <small>{activeClockSession ? "Currently clocked in" : "Clocked out"}</small>
                  </article>
                  <article className="metric-card">
                    <div className="metric-icon sage">
                      <Icon name="invoice" />
                    </div>
                    <p>My transactions</p>
                    <strong>
                      {visibleSales.length} <em>sales</em>
                    </strong>
                    <small>{currentEmployee.employeeId}</small>
                  </article>
                </>
              )}
            </div>

            <section className="quick-section">
              <div className="section-heading">
                <h2>Quick actions</h2>
              </div>
              <div className="quick-grid">
                {accessMode === "Owner" ? (
                  <>
                    <button onClick={newSale} className="quick-action primary-action">
                      <span>
                        <Icon name="plus" />
                      </span>
                      <b>New Sale</b>
                    </button>
                    <button className="quick-action" onClick={() => openSection("dues")}>
                      <span>
                        <Icon name="wallet" />
                      </span>
                      <b>Dues</b>
                    </button>
                    <button className="quick-action" onClick={() => setScreen("stock")}>
                      <span>
                        <Icon name="box" />
                      </span>
                      <b>Stock</b>
                    </button>
                    <button
                      className="quick-action staff-action advances-action"
                      onClick={() => openSection("advances")}
                    >
                      <span>
                        <Icon name="wallet" />
                      </span>
                      <b>Advances</b>
                      <small>
                        {advanceCustomers.length} customers · {money(totalCustomerAdvance)}
                      </small>
                      <Icon name="chevron" size={16} />
                    </button>
                    <button
                      className="quick-action staff-action"
                      onClick={() => openSection("staff")}
                    >
                      <span>
                        <Icon name="user" />
                      </span>
                      <b>Staff & Payroll</b>
                      <small>{employees.length} active employees</small>
                      <Icon name="chevron" size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => openSection("new-sale")}
                      className="quick-action primary-action"
                    >
                      <span>
                        <Icon name="plus" />
                      </span>
                      <b>New Sale</b>
                    </button>
                    <button className="quick-action" onClick={() => setScreen("stock")}>
                      <span>
                        <Icon name="box" />
                      </span>
                      <b>Stock</b>
                    </button>
                    <button className="quick-action" onClick={() => setScreen("my-attendance")}>
                      <span>
                        <Icon name="calendar" />
                      </span>
                      <b>My Work</b>
                    </button>
                    <button
                      className="quick-action staff-action advances-action"
                      onClick={() => openSection("dues")}
                    >
                      <span>
                        <Icon name="wallet" />
                      </span>
                      <b>Customer Dues</b>
                      <small>Lookup and collect customer payments</small>
                      <Icon name="chevron" size={16} />
                    </button>
                    <button
                      className="quick-action staff-action"
                      onClick={() => setScreen("clock")}
                    >
                      <span>
                        <Icon name="clock" />
                      </span>
                      <b>{activeClockSession ? "Clock Out" : "Clock In"}</b>
                      <small>
                        {activeClockSession
                          ? `Working ${formatMinutes(activeWorkMinutes)}`
                          : "Start work session"}
                      </small>
                      <Icon name="chevron" size={16} />
                    </button>
                  </>
                )}
              </div>
            </section>

            <section className="sales-card">
              <div className="section-heading">
                <div>
                  <h2>Sales overview</h2>
                  <p>Today’s performance</p>
                </div>
              </div>
              <div className="sale-row">
                <div className="sale-label">
                  <span className="round-icon terracotta">
                    <Icon name="store" size={18} />
                  </span>
                  <div>
                    <b>Store Sales</b>
                    <small>
                      {accessMode === "Owner"
                        ? storeSalesCount
                        : visibleSales.filter((sale) => sale.source === "Store Sale").length}{" "}
                      invoices
                    </small>
                  </div>
                </div>
                <strong>
                  {money(accessMode === "Owner" ? storeSalesTotal : visibleStoreSales)}
                </strong>
              </div>
              <div className="bar">
                <span
                  style={{
                    width: `${
                      (accessMode === "Owner" ? salesRevenue : visibleSalesRevenue)
                        ? ((accessMode === "Owner" ? storeSalesTotal : visibleStoreSales) /
                            (accessMode === "Owner" ? salesRevenue : visibleSalesRevenue)) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <div className="sale-row">
                <div className="sale-label">
                  <span className="round-icon muted">
                    <Icon name="home" size={18} />
                  </span>
                  <div>
                    <b>Home Sales</b>
                    <small>
                      {accessMode === "Owner"
                        ? homeSalesCount
                        : visibleSales.filter((sale) => sale.source === "Home Sale").length}{" "}
                      invoices
                    </small>
                  </div>
                </div>
                <strong>{money(accessMode === "Owner" ? homeSalesTotal : visibleHomeSales)}</strong>
              </div>
              <div className="bar secondary">
                <span
                  style={{
                    width: `${
                      (accessMode === "Owner" ? salesRevenue : visibleSalesRevenue)
                        ? ((accessMode === "Owner" ? homeSalesTotal : visibleHomeSales) /
                            (accessMode === "Owner" ? salesRevenue : visibleSalesRevenue)) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </section>
            <section className="dashboard-activity">
              <div className="section-heading">
                <div>
                  <h2>Recent activity</h2>
                  <p>Latest sales and payments</p>
                </div>
                <button onClick={() => setScreen("transactions")}>View all</button>
              </div>
              <div>
                {(accessMode === "Owner" ? sales : visibleSales).slice(0, 3).map((sale) => (
                  <button
                    key={sale.id}
                    onClick={() => {
                      setSelectedTransactionId(sale.id);
                      setScreen("transaction-detail");
                    }}
                  >
                    <span>
                      <Icon name="invoice" size={16} />
                    </span>
                    <div>
                      <b>{sale.customer}</b>
                      <small>
                        {sale.invoiceId} · {sale.method}
                      </small>
                    </div>
                    <strong>{money(sale.total)}</strong>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {screen === "transactions" && (
          <div className="screen business-screen">
            <Header
              title={accessMode === "Employee" ? "My Transactions" : "Transactions"}
              subtitle={
                accessMode === "Employee"
                  ? `${currentEmployee.name} · ${currentEmployee.employeeId}`
                  : "Complete sales and payment history"
              }
              onBack={() => setScreen("dashboard")}
              onMenu={() => setDrawerOpen(true)}
            />
            <section className="business-content">
              <div className="transaction-summary">
                <div>
                  <span>Sales revenue</span>
                  <strong>{money(visibleSalesRevenue)}</strong>
                </div>
                <div>
                  <span>Money received</span>
                  <strong>{money(visibleMoneyReceived + visibleDuePaymentTotal)}</strong>
                </div>
              </div>
              {accessMode === "Owner" && (
                <label className="employee-transaction-filter">
                  <span>Employee</span>
                  <select
                    value={transactionEmployeeFilter}
                    onChange={(event) => setTransactionEmployeeFilter(event.target.value)}
                  >
                    <option value="All">All employees</option>
                    <option value="OWNER">Owner / Admin</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.employeeId}>
                        {employee.name} · {employee.employeeId}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className="search-field">
                <Icon name="search" size={19} />
                <input
                  value={transactionSearch}
                  onChange={(event) => setTransactionSearch(event.target.value)}
                  placeholder="Search customer, invoice, or method"
                />
              </label>
              <div className="list-heading">
                <span>All transactions</span>
                <small>
                  {filteredTransactions.length +
                    visibleStockTransactions.length +
                    visibleDuePayments.length}{" "}
                  records
                </small>
              </div>
              <div className="transaction-list">
                {filteredTransactions.map((sale) => (
                  <button
                    className="transaction-row"
                    key={sale.id}
                    onClick={() => {
                      setSelectedTransactionId(sale.id);
                      setScreen("transaction-detail");
                    }}
                  >
                    <span className="transaction-icon">
                      <Icon name="invoice" size={19} />
                    </span>
                    <span className="transaction-info">
                      <b>{sale.customer}</b>
                      <small>
                        {sale.invoiceId} · {sale.date}
                      </small>
                      <em>
                        {sale.source} · {sale.method} · {sale.employeeName}
                      </em>
                    </span>
                    <span className="transaction-value">
                      <b>{money(sale.total)}</b>
                      <small>{sale.due > 0 ? `Due ${money(sale.due)}` : "Paid"}</small>
                      <Icon name="chevron" size={15} />
                    </span>
                  </button>
                ))}
                {visibleStockTransactions.map((entry) => (
                  <button
                    className="transaction-row"
                    key={`stock-${entry.id}`}
                    onClick={() => {
                      setSelectedStockId(entry.productId);
                      setScreen("stock-detail");
                    }}
                  >
                    <span className="transaction-icon stock-transaction-icon">
                      <Icon name="box" size={19} />
                    </span>
                    <span className="transaction-info">
                      <b>Stock Entry · {entry.productName}</b>
                      <small>
                        {entry.reference} · {entry.date} · {entry.time}
                      </small>
                      <em>
                        {entry.employeeName} · {entry.employeeId}
                      </em>
                    </span>
                    <span className="transaction-value">
                      <b>+{entry.quantity} pieces</b>
                      <small>{canViewStockCosts ? money(entry.totalCost) : "Stock added"}</small>
                      <Icon name="chevron" size={15} />
                    </span>
                  </button>
                ))}
                {visibleDuePayments.map((entry) => (
                  <button
                    className="transaction-row"
                    key={`due-${entry.id}`}
                    onClick={() => {
                      setLastDuePayment(entry);
                      setSelectedCustomerId(Number(entry.customerId.replace("CUS-", "")));
                      setScreen("due-payment-confirmation");
                    }}
                  >
                    <span className="transaction-icon due-transaction-icon">
                      <Icon name="wallet" size={19} />
                    </span>
                    <span className="transaction-info">
                      <b>Due Payment · {entry.customerName}</b>
                      <small>
                        {entry.reference} · {entry.date} · {entry.time}
                      </small>
                      <em>
                        {entry.employeeName} · {entry.employeeId} · {entry.method}
                      </em>
                    </span>
                    <span className="transaction-value">
                      <b>{money(entry.amountReceived)}</b>
                      <small>Due now {money(entry.remainingDue)}</small>
                      <Icon name="chevron" size={15} />
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {screen === "transaction-detail" && selectedTransaction && (
          <div className="screen business-screen detail-screen">
            <Header
              title="Transaction Details"
              subtitle={selectedTransaction.invoiceId}
              onBack={() => setScreen("transactions")}
              onHome={() => setScreen("dashboard")}
            />
            <section className="business-content">
              <div className="transaction-detail-hero">
                <span>Sale total</span>
                <strong>{money(selectedTransaction.total)}</strong>
                <small>
                  {selectedTransaction.date} · {selectedTransaction.source}
                </small>
              </div>
              <div className="detail-data-card">
                <div>
                  <span>Customer</span>
                  <b>{selectedTransaction.customer}</b>
                </div>
                <div>
                  <span>Payment method</span>
                  <b>{selectedTransaction.method}</b>
                </div>
                <div>
                  <span>Created by</span>
                  <b>
                    {selectedTransaction.employeeName} · {selectedTransaction.employeeId}
                  </b>
                </div>
                <div>
                  <span>Date and time</span>
                  <b>
                    {selectedTransaction.date} · {selectedTransaction.time}
                  </b>
                </div>
                <div>
                  <span>Transaction type</span>
                  <b>{selectedTransaction.transactionType}</b>
                </div>
                <div>
                  <span>Paid amount</span>
                  <b>{money(selectedTransaction.paid)}</b>
                </div>
                {selectedTransaction.advanceUsed > 0 && (
                  <div>
                    <span>Advance applied</span>
                    <b>{money(selectedTransaction.advanceUsed)}</b>
                  </div>
                )}
                {selectedTransaction.changeReturned > 0 && (
                  <div>
                    <span>Change returned</span>
                    <b>{money(selectedTransaction.changeReturned)}</b>
                  </div>
                )}
                {selectedTransaction.customerAdvance > 0 && (
                  <div>
                    <span>Customer advance</span>
                    <b>{money(selectedTransaction.customerAdvance)}</b>
                  </div>
                )}
                <div className="detail-total-line">
                  <span>Remaining due</span>
                  <b>{money(selectedTransaction.due)}</b>
                </div>
              </div>
              <div className="history-heading">
                <h2>Items sold</h2>
                <p>Products on this invoice</p>
              </div>
              <div className="transaction-item-list">
                {selectedTransaction.items.map((item) => (
                  <div key={item.id}>
                    <span>
                      <b>{item.product}</b>
                      <small>
                        {item.quantity} × {money(item.price)}
                      </small>
                    </span>
                    <strong>{money(item.quantity * item.price)}</strong>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {screen === "customers" && (
          <div className="screen business-screen">
            <Header
              title="Customers"
              subtitle="Complete customer directory"
              onBack={() => setScreen("dashboard")}
              onMenu={() => setDrawerOpen(true)}
            />
            <section className="business-content">
              <div className="directory-summary">
                <div>
                  <span>Total customers</span>
                  <strong>{dueCustomers.length}</strong>
                </div>
                <div>
                  <span>Settled accounts</span>
                  <strong>
                    {
                      dueCustomers.filter((entry) => entry.due === 0 && (entry.advance ?? 0) === 0)
                        .length
                    }
                  </strong>
                </div>
              </div>
              <label className="search-field">
                <Icon name="search" size={19} />
                <input
                  value={customerSearch}
                  onChange={(event) => setCustomerSearch(event.target.value)}
                  placeholder="Search by name or phone"
                />
              </label>
              <div className="list-heading">
                <span>Customer accounts</span>
                <small>{filteredDirectoryCustomers.length} found</small>
              </div>
              <div className="customer-list">
                {filteredDirectoryCustomers.map((entry) => (
                  <button
                    className="customer-row"
                    key={entry.id}
                    onClick={() => {
                      setSelectedDirectoryCustomerId(entry.id);
                      setScreen("customer-detail");
                    }}
                  >
                    <span className="customer-avatar">
                      {entry.name
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                    <span className="customer-info">
                      <b>{entry.name}</b>
                      <small>{entry.phone}</small>
                      <em>Last purchase · {entry.lastPurchase}</em>
                    </span>
                    <span className="customer-balances">
                      {entry.due === 0 && (entry.advance ?? 0) === 0 ? (
                        <em className="fully-paid-status">Settled</em>
                      ) : (
                        <>
                          <span className="balance due-balance">
                            <small>Due</small>
                            <b>{money(entry.due)}</b>
                          </span>
                          <span className="balance advance-balance">
                            <small>Advance</small>
                            <b>{money(entry.advance ?? 0)}</b>
                          </span>
                        </>
                      )}
                      <Icon name="chevron" size={16} />
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {screen === "customer-detail" && selectedDirectoryCustomer && (
          <div className="screen business-screen detail-screen">
            <Header
              title="Customer Details"
              subtitle="Purchases, payments, dues, and advances"
              onBack={() => setScreen("customers")}
              onHome={() => setScreen("dashboard")}
            />
            <section className="business-content">
              <div className="customer-profile">
                <span className="customer-avatar large">
                  {selectedDirectoryCustomer.name
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <h2>{selectedDirectoryCustomer.name}</h2>
                <p>{selectedDirectoryCustomer.phone}</p>
                <div className="customer-account-totals">
                  <div>
                    <span>Current due</span>
                    <strong>{money(selectedDirectoryCustomer.due)}</strong>
                  </div>
                  <div>
                    <span>Current advance</span>
                    <strong>{money(selectedDirectoryCustomer.advance ?? 0)}</strong>
                  </div>
                </div>
              </div>
              <div className="history-heading">
                <h2>Purchase & payment history</h2>
                <p>Complete customer activity</p>
              </div>
              <div className="history-list">
                {selectedDirectoryCustomer.history.map((event) => (
                  <article
                    className={
                      event.type === "Payment" ? "history-row payment-event" : "history-row"
                    }
                    key={event.id}
                  >
                    <span
                      className={
                        event.type === "Purchase" ? "history-icon purchase" : "history-icon payment"
                      }
                    >
                      <Icon name={event.type === "Purchase" ? "bag" : "wallet"} size={18} />
                    </span>
                    <div>
                      <b>{event.type}</b>
                      <small>
                        {event.type === "Payment"
                          ? `Amount received: ${money(event.amount)}`
                          : event.detail}
                      </small>
                      {event.type === "Payment" && <em>Method: {event.method}</em>}
                      <time>{event.date}</time>
                    </div>
                    {event.type === "Purchase" && <strong>+{money(event.amount)}</strong>}
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}

        {screen === "profit" && (
          <div className="screen business-screen">
            <Header
              title="Profit & Costs"
              subtitle="Business performance summary"
              onBack={leaveProtectedSection}
              onMenu={() => setDrawerOpen(true)}
            />
            {accessMode === "Employee" && unlockedSection !== "profit" ? (
              <section className="business-content">
                <div className="restricted-card">
                  <Icon name="shield" size={30} />
                  <h2>Owner access required</h2>
                  <p>Profit, buying costs, and payroll totals are private business information.</p>
                </div>
              </section>
            ) : (
              <section className="business-content">
                <label className="period-filter">
                  <span>Reporting period</span>
                  <select
                    value={profitPeriod}
                    onChange={(event) =>
                      setProfitPeriod(event.target.value as "May 2025" | "All time")
                    }
                  >
                    <option>May 2025</option>
                    <option>All time</option>
                  </select>
                </label>
                <div className="profit-hero">
                  <span>Estimated net profit</span>
                  <strong>{money(reportingNetProfit)}</strong>
                  <small>{profitPeriod}</small>
                </div>
                <div className="financial-grid">
                  <article>
                    <span>Sales revenue</span>
                    <strong>{money(reportingRevenue)}</strong>
                  </article>
                  <article>
                    <span>Gross profit</span>
                    <strong>{money(reportingGrossProfit)}</strong>
                  </article>
                  <article>
                    <span>Product purchase costs</span>
                    <strong>{money(reportingPurchaseCosts)}</strong>
                  </article>
                  <article>
                    <span>Additional expenses</span>
                    <strong>{money(reportingAdditionalExpenses)}</strong>
                  </article>
                  <article>
                    <span>Payroll costs</span>
                    <strong>{money(payrollCosts)}</strong>
                  </article>
                  <article className="net">
                    <span>Net profit</span>
                    <strong>{money(reportingNetProfit)}</strong>
                  </article>
                </div>
                <div className="sales-card profit-source-card">
                  <div className="section-heading">
                    <div>
                      <h2>Sales by source</h2>
                      <p>Store Sales vs Home Sales</p>
                    </div>
                  </div>
                  <div className="sale-row">
                    <div className="sale-label">
                      <span className="round-icon terracotta">
                        <Icon name="store" size={18} />
                      </span>
                      <b>Store Sales</b>
                    </div>
                    <strong>{money(reportingStoreSales)}</strong>
                  </div>
                  <div className="bar">
                    <span
                      style={{
                        width: `${reportingRevenue ? (reportingStoreSales / reportingRevenue) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <div className="sale-row">
                    <div className="sale-label">
                      <span className="round-icon muted">
                        <Icon name="home" size={18} />
                      </span>
                      <b>Home Sales</b>
                    </div>
                    <strong>{money(reportingHomeSales)}</strong>
                  </div>
                  <div className="bar secondary">
                    <span
                      style={{
                        width: `${reportingRevenue ? (reportingHomeSales / reportingRevenue) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

        {screen === "backups" && (
          <div className="screen business-screen">
            <Header
              title="Backups"
              subtitle="Business data protection"
              onBack={leaveProtectedSection}
              onMenu={() => setDrawerOpen(true)}
            />
            <section className="business-content">
              <div className="backup-actions">
                <button
                  className="primary-button"
                  onClick={createBackup}
                  disabled={accessMode === "Employee" && unlockedSection !== "backups"}
                >
                  <Icon name="database" size={19} /> Create Backup
                </button>
                <button
                  className="secondary-button"
                  onClick={exportBusinessData}
                  disabled={accessMode === "Employee" && unlockedSection !== "backups"}
                >
                  <Icon name="invoice" size={19} /> Export Business Data
                </button>
              </div>
              <div className="history-heading">
                <h2>Backup history</h2>
                <p>Recent copies of business data</p>
              </div>
              <div className="backup-list">
                {backups.map((backup) => (
                  <article key={backup.id}>
                    <span>
                      <Icon name="database" size={19} />
                    </span>
                    <div>
                      <b>{backup.type}</b>
                      <small>
                        {backup.date} · {backup.time}
                      </small>
                    </div>
                    <em>Complete</em>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}

        {screen === "access" && (
          <div className="screen business-screen">
            <Header
              title="Access"
              subtitle="Workspace visibility and permissions"
              onBack={leaveProtectedSection}
              onMenu={() => setDrawerOpen(true)}
            />
            <section className="business-content">
              <div className="current-mode-card">
                <span>Current workspace mode</span>
                <strong>{accessMode} View</strong>
              </div>
              {accessMode === "Employee" && unlockedSection !== "access" ? (
                <div className="restricted-card access-restricted">
                  <Icon name="shield" size={30} />
                  <h2>Owner access required</h2>
                  <p>Access settings and employee permissions are protected.</p>
                  <button
                    className="primary-button"
                    onClick={() => requestOwnerPassword("owner-mode")}
                  >
                    Switch to Owner View
                  </button>
                </div>
              ) : (
                <>
                  <div className="access-switch">
                    {(["Owner", "Employee"] as const).map((role) => (
                      <button
                        key={role}
                        className={accessMode === role ? "active" : ""}
                        onClick={() => {
                          setAccessMode(role);
                          if (role === "Employee") setUnlockedSection(null);
                        }}
                      >
                        {role} view
                      </button>
                    ))}
                  </div>
                  <article className="access-card owner">
                    <span>
                      <Icon name="shield" size={23} />
                    </span>
                    <div>
                      <h2>Owner / Admin access</h2>
                      <p>
                        Full access to sales, buying prices, profit, payroll, backups, and workspace
                        controls.
                      </p>
                    </div>
                  </article>
                  <article className="access-card">
                    <span>
                      <Icon name="users" size={23} />
                    </span>
                    <div>
                      <h2>Employee access</h2>
                      <p>
                        Can record sales and payments, view customers, and check inventory
                        quantities.
                      </p>
                    </div>
                  </article>
                  <div className="permission-list">
                    <div>
                      <span>Sales and customers</span>
                      <b>Owner & Employees</b>
                    </div>
                    <div>
                      <span>Buying prices and profit</span>
                      <b>Owner only</b>
                    </div>
                    <div>
                      <span>Payroll and backups</span>
                      <b>Owner only</b>
                    </div>
                    <div>
                      <span>Access controls</span>
                      <b>Owner only</b>
                    </div>
                  </div>
                  <div className="employee-permissions">
                    <div className="history-heading">
                      <h2>Employee permissions</h2>
                      <p>Choose what each employee can manage</p>
                    </div>
                    {employees.map((employee) => (
                      <article key={employee.id}>
                        <div>
                          <b>{employee.name}</b>
                          <small>
                            {employee.employeeId} · {employee.role}
                          </small>
                        </div>
                        <label>
                          <span>Sales</span>
                          <button
                            className={employeePermissions[employee.id].sales ? "enabled" : ""}
                            onClick={() => updateEmployeePermission(employee.id, "sales")}
                            aria-label={`Toggle sales permission for ${employee.name}`}
                          >
                            <i />
                          </button>
                        </label>
                        <label>
                          <span>Customers</span>
                          <button
                            className={employeePermissions[employee.id].customers ? "enabled" : ""}
                            onClick={() => updateEmployeePermission(employee.id, "customers")}
                            aria-label={`Toggle customer permission for ${employee.name}`}
                          >
                            <i />
                          </button>
                        </label>
                        <label>
                          <span>Costs</span>
                          <button
                            className={employeePermissions[employee.id].stockCosts ? "enabled" : ""}
                            onClick={() => updateEmployeePermission(employee.id, "stockCosts")}
                            aria-label={`Toggle buying cost permission for ${employee.name}`}
                          >
                            <i />
                          </button>
                        </label>
                        <label>
                          <span>Dues</span>
                          <button
                            className={
                              employeePermissions[employee.id].dueCollection ? "enabled" : ""
                            }
                            onClick={() => updateEmployeePermission(employee.id, "dueCollection")}
                            aria-label={`Toggle due collection permission for ${employee.name}`}
                          >
                            <i />
                          </button>
                        </label>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </section>
          </div>
        )}

        {screen === "my-attendance" && (
          <div className="screen business-screen">
            <Header
              title="My Attendance"
              subtitle={`${currentEmployee.name} · ${currentEmployee.employeeId}`}
              onBack={() => setScreen("dashboard")}
              onMenu={() => setDrawerOpen(true)}
            />
            <section className="business-content">
              <div className="work-status-card">
                <span className={activeClockSession ? "active" : ""}>
                  <Icon name="clock" size={24} />
                </span>
                <div>
                  <small>Current status</small>
                  <h2>{activeClockSession ? "Clocked In" : "Clocked Out"}</h2>
                  <p>
                    {activeClockSession
                      ? `Clocked in at ${activeClockSession.clockIn} · Working ${formatMinutes(activeWorkMinutes)}`
                      : "No active work session"}
                  </p>
                </div>
              </div>
              <div className="my-work-grid">
                <article>
                  <span>Today’s working hours</span>
                  <strong>{formatMinutes(todayWorkMinutes)}</strong>
                </article>
                <article>
                  <span>Working days this month</span>
                  <strong>{currentEmployee.daysWorked}</strong>
                </article>
                <article>
                  <span>Total hours this month</span>
                  <strong>{currentEmployee.hoursWorked}h</strong>
                </article>
                <article>
                  <span>Employee ID</span>
                  <strong>{currentEmployee.employeeId}</strong>
                </article>
              </div>
              <button
                className="primary-button attendance-clock-action"
                onClick={() => {
                  setCompletedWorkMinutes(null);
                  setScreen("clock");
                }}
              >
                <Icon name="clock" size={19} />
                {activeClockSession ? "Clock Out" : "Clock In"}
              </button>
              <div className="history-heading">
                <h2>Recent work history</h2>
                <p>Clock-in and clock-out sessions</p>
              </div>
              <div className="attendance-history">
                {employeeAttendance.map((session) => (
                  <article key={session.id}>
                    <span className="attendance-date">
                      <b>{session.date.split(" ")[0]}</b>
                      <small>{session.date.split(" ").slice(1).join(" ")}</small>
                    </span>
                    <div>
                      <b>
                        {session.clockIn} — {session.clockOut ?? "Working now"}
                      </b>
                      <small>Clock In / Clock Out</small>
                    </div>
                    <strong>
                      {session.clockOut
                        ? formatMinutes(session.minutes)
                        : formatMinutes(activeWorkMinutes)}
                    </strong>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}

        {screen === "clock" && (
          <div className="screen business-screen">
            <Header
              title="Clock In / Clock Out"
              subtitle="Employee work session"
              onBack={() => setScreen("dashboard")}
              onMenu={() => setDrawerOpen(true)}
            />
            <section className="business-content">
              {completedWorkMinutes !== null ? (
                <div className="work-complete-card">
                  <div className="success-mark">
                    <span>
                      <Icon name="check" size={30} />
                    </span>
                  </div>
                  <p className="eyebrow">Work completed</p>
                  <h1>Today: {formatMinutes(completedWorkMinutes)}</h1>
                  <p>
                    {hour >= 21 || hour < 5
                      ? "Thank you for your hard work. Have a good night!"
                      : hour >= 17
                        ? "Thank you for your hard work. Have a good evening!"
                        : "Thank you for your hard work. Have a good day!"}
                  </p>
                  <button className="primary-button" onClick={() => setScreen("my-attendance")}>
                    View My Attendance <Icon name="chevron" size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <label className="field clock-employee-select">
                    <span>Employee ID</span>
                    <select
                      value={activeClockSession ? loggedEmployeeId : clockEmployeeId}
                      disabled={Boolean(activeClockSession)}
                      onChange={(event) => setClockEmployeeId(event.target.value)}
                    >
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.employeeId}>
                          {employee.employeeId} — {employee.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className={activeClockSession ? "clock-card active" : "clock-card"}>
                    <span>
                      <Icon name="clock" size={30} />
                    </span>
                    <p>{activeClockSession ? "Currently working" : "Ready to begin work"}</p>
                    <h2>
                      {activeClockSession
                        ? formatMinutes(activeWorkMinutes)
                        : formatTime(currentTime)}
                    </h2>
                    <small>
                      {activeClockSession
                        ? `Clocked in at ${activeClockSession.clockIn}`
                        : `${employees.find((entry) => entry.employeeId === clockEmployeeId)?.name} · ${clockEmployeeId}`}
                    </small>
                  </div>
                  <button
                    className={
                      activeClockSession ? "primary-button clock-out-button" : "primary-button"
                    }
                    onClick={activeClockSession ? clockOut : clockIn}
                  >
                    <Icon name={activeClockSession ? "close" : "clock"} size={19} />
                    {activeClockSession ? "Clock Out" : "Clock In"}
                  </button>
                  <div className="info-note clock-note">
                    <span>i</span>
                    <p>
                      Work duration is tracked automatically and added to attendance and payroll
                      totals after clock-out.
                    </p>
                  </div>
                </>
              )}
            </section>
          </div>
        )}

        {screen === "dues" && (
          <div className="screen business-screen">
            <Header
              title={accessMode === "Employee" ? "Customer Due Lookup" : "Customer Dues"}
              subtitle={
                accessMode === "Employee"
                  ? "Search and collect outstanding customer payments"
                  : `${activeDueCustomers.length} customers with pending payments`
              }
              onBack={() => setScreen("dashboard")}
              onMenu={() => setDrawerOpen(true)}
            />
            <section className="business-content">
              {accessMode === "Owner" && (
                <div className="business-summary due-summary">
                  <span>Total outstanding</span>
                  <strong>{money(totalCustomerDue)}</strong>
                  <small>Updated today</small>
                </div>
              )}
              <label className="search-field">
                <Icon name="search" size={19} />
                <input
                  value={dueSearch}
                  onChange={(event) => setDueSearch(event.target.value)}
                  placeholder="Search by name or phone"
                />
              </label>
              <div className="list-heading">
                <span>Customers</span>
                <small>{filteredDueCustomers.length} found</small>
              </div>
              <div className="customer-list">
                {filteredDueCustomers.map((entry) => (
                  <button
                    className="customer-row"
                    key={entry.id}
                    onClick={() => openDueCustomer(entry.id)}
                  >
                    <span className="customer-avatar">
                      {entry.name
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                    <span className="customer-info">
                      <b>{entry.name}</b>
                      <small>{entry.phone}</small>
                      <em>
                        {accessMode === "Employee"
                          ? `${entry.history.find((event) => event.type === "Purchase")?.detail ?? "Invoice"} · ${entry.lastPurchase}`
                          : `Last purchase · ${entry.lastPurchase}`}
                      </em>
                    </span>
                    <span className="customer-balances">
                      {(entry.due > 0 || (entry.advance ?? 0) > 0) && (
                        <>
                          <span className="balance due-balance">
                            <small>Due</small>
                            <b>{money(entry.due)}</b>
                          </span>
                          <span className="balance advance-balance">
                            <small>Advance</small>
                            <b>{money(entry.advance ?? 0)}</b>
                          </span>
                        </>
                      )}
                      {entry.due === 0 && (entry.advance ?? 0) === 0 && (
                        <em className="fully-paid-status">Fully Paid</em>
                      )}
                      <Icon name="chevron" size={16} />
                    </span>
                  </button>
                ))}
                {filteredDueCustomers.length === 0 && (
                  <div className="empty-state">
                    <Icon name="search" />
                    <b>No customers found</b>
                    <p>Try a different name or phone number.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {screen === "due-detail" && selectedDueCustomer && (
          <div className="screen business-screen detail-screen">
            <Header
              title="Due Details"
              subtitle="Customer account and history"
              onBack={() => setScreen("dues")}
              onHome={() => setScreen("dashboard")}
            />
            <section className="business-content">
              <div className="customer-profile">
                <span className="customer-avatar large">
                  {selectedDueCustomer.name
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <h2>{selectedDueCustomer.name}</h2>
                <p>{selectedDueCustomer.phone}</p>
                <div className="profile-due">
                  <span>Remaining due</span>
                  <strong>{money(selectedDueCustomer.due)}</strong>
                </div>
                {(selectedDueCustomer.advance ?? 0) > 0 && (
                  <div className="profile-advance">
                    <span>Available Advance</span>
                    <strong>{money(selectedDueCustomer.advance ?? 0)}</strong>
                  </div>
                )}
              </div>

              {showPaymentForm ? (
                <div className="record-card">
                  <div className="section-heading">
                    <div>
                      <h2>Record payment</h2>
                      <p>Enter the amount received today</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowPaymentForm(false);
                        setDuePaymentMethod("");
                        setDueExcessOption("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                  <label className="field compact payment-entry">
                    <span>Payment amount</span>
                    <div className="amount-input">
                      <b>BDT</b>
                      <input
                        autoFocus
                        type="number"
                        min="1"
                        value={duePayment}
                        onChange={(event) => {
                          setDuePayment(event.target.value);
                          setDueExcessOption("");
                        }}
                        placeholder="0"
                      />
                    </div>
                  </label>
                  <div className="quick-amounts">
                    {[500, 1000, selectedDueCustomer.due]
                      .filter(
                        (amount, index, amounts) =>
                          amount <= selectedDueCustomer.due && amounts.indexOf(amount) === index,
                      )
                      .map((amount) => (
                        <button
                          key={amount}
                          onClick={() => {
                            setDuePayment(String(amount));
                            setDueExcessOption("");
                          }}
                        >
                          {amount === selectedDueCustomer.due ? "Full due" : money(amount)}
                        </button>
                      ))}
                  </div>
                  {duePaymentExcess > 0 && (
                    <div className="due-excess-section">
                      <div className="excess-total">
                        <span>Excess Amount</span>
                        <strong>{money(duePaymentExcess)}</strong>
                      </div>
                      <fieldset>
                        <legend>
                          Handle excess payment <b className="required">Required</b>
                        </legend>
                        <div className="excess-options">
                          <button
                            className={dueExcessOption === "return" ? "active" : ""}
                            onClick={() => setDueExcessOption("return")}
                          >
                            <span>
                              <Icon name="wallet" size={20} />
                            </span>
                            <div>
                              <b>Return Change</b>
                              <small>Change Returned: {money(duePaymentExcess)}</small>
                            </div>
                            <i>{dueExcessOption === "return" && <Icon name="check" size={13} />}</i>
                          </button>
                          <button
                            className={dueExcessOption === "advance" ? "active" : ""}
                            onClick={() => setDueExcessOption("advance")}
                          >
                            <span>
                              <Icon name="user" size={20} />
                            </span>
                            <div>
                              <b>Keep as Customer Advance</b>
                              <small>Save {money(duePaymentExcess)} as available advance</small>
                            </div>
                            <i>
                              {dueExcessOption === "advance" && <Icon name="check" size={13} />}
                            </i>
                          </button>
                        </div>
                      </fieldset>
                    </div>
                  )}
                  <label className="field compact due-method-field">
                    <span>
                      Payment method <b className="required">Required</b>
                    </span>
                    <select
                      value={duePaymentMethod}
                      onChange={(event) =>
                        setDuePaymentMethod(event.target.value as DuePaymentMethod | "")
                      }
                    >
                      <option value="" disabled>
                        Select payment method
                      </option>
                      {(["Cash", "Bank Transfer", "bKash", "Nagad"] as DuePaymentMethod[]).map(
                        (paymentMethod) => (
                          <option key={paymentMethod} value={paymentMethod}>
                            {paymentMethod}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                  <button
                    className="primary-button"
                    disabled={
                      !Number(duePayment) ||
                      !duePaymentMethod ||
                      (duePaymentExcess > 0 && !dueExcessOption)
                    }
                    onClick={recordDuePayment}
                  >
                    Save payment <Icon name="check" size={19} />
                  </button>
                </div>
              ) : (
                selectedDueCustomer.due > 0 && (
                  <button
                    className="primary-button record-trigger"
                    onClick={() => {
                      setDuePaymentMethod("");
                      setDueExcessOption("");
                      setShowPaymentForm(true);
                    }}
                  >
                    <Icon name="wallet" /> Record Payment
                  </button>
                )
              )}

              {selectedDueCustomer.due === 0 && (selectedDueCustomer.advance ?? 0) === 0 && (
                <div className="paid-message">
                  <span>
                    <Icon name="check" size={18} />
                  </span>
                  <div>
                    <b>Fully paid</b>
                    <p>This customer has no remaining due.</p>
                  </div>
                </div>
              )}

              <div className="history-heading">
                <h2>Purchase & payment history</h2>
                <p>Most recent activity first</p>
              </div>
              <div className="history-list">
                {selectedDueCustomer.history.map((event) => (
                  <article
                    className={
                      event.type === "Payment" ? "history-row payment-event" : "history-row"
                    }
                    key={event.id}
                  >
                    <span
                      className={
                        event.type === "Purchase" ? "history-icon purchase" : "history-icon payment"
                      }
                    >
                      <Icon name={event.type === "Purchase" ? "bag" : "wallet"} size={18} />
                    </span>
                    <div>
                      <b>{event.type}</b>
                      {event.type === "Payment" ? (
                        <>
                          <small>Amount received: {money(event.amount)}</small>
                          <em>Method: {event.method}</em>
                          {event.appliedToDue !== undefined && (
                            <em>Applied to due: {money(event.appliedToDue)}</em>
                          )}
                          {Boolean(event.changeReturned) && (
                            <em>Change Returned: {money(event.changeReturned ?? 0)}</em>
                          )}
                          {Boolean(event.advanceCreated) && (
                            <em>Customer Advance: {money(event.advanceCreated ?? 0)}</em>
                          )}
                          <time>Date: {event.date}</time>
                        </>
                      ) : (
                        <>
                          <small>{event.detail}</small>
                          <time>{event.date}</time>
                        </>
                      )}
                    </div>
                    {event.type === "Purchase" && <strong>+{money(event.amount)}</strong>}
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}

        {screen === "due-payment-confirmation" && lastDuePayment && (
          <div className="screen confirmation-screen due-payment-confirmation">
            <div className="success-mark">
              <span>
                <Icon name="check" size={34} />
              </span>
            </div>
            <p className="eyebrow">Payment recorded</p>
            <h1>Due payment updated</h1>
            <p className="success-copy">Remaining due: {money(lastDuePayment.remainingDue)}</p>
            <section className="receipt payment-receipt">
              <div className="receipt-top">
                <span className="mini-seal">M</span>
                <div>
                  <b>Mukti Saree</b>
                  <small>{lastDuePayment.reference}</small>
                </div>
                <time>{lastDuePayment.date}</time>
              </div>
              <div className="receipt-meta">
                <div>
                  <span>Customer</span>
                  <b>{lastDuePayment.customerName}</b>
                </div>
                <div>
                  <span>Customer ID</span>
                  <b>{lastDuePayment.customerId}</b>
                </div>
              </div>
              <div className="payment-receipt-lines">
                <div>
                  <span>Previous due</span>
                  <b>{money(lastDuePayment.previousDue)}</b>
                </div>
                <div>
                  <span>Amount received</span>
                  <b>{money(lastDuePayment.amountReceived)}</b>
                </div>
                <div>
                  <span>Payment method</span>
                  <b>{lastDuePayment.method}</b>
                </div>
                {lastDuePayment.changeReturned > 0 && (
                  <div>
                    <span>Change returned</span>
                    <b>{money(lastDuePayment.changeReturned)}</b>
                  </div>
                )}
                {lastDuePayment.advanceCreated > 0 && (
                  <div>
                    <span>Customer advance</span>
                    <b>{money(lastDuePayment.advanceCreated)}</b>
                  </div>
                )}
                <div className="receipt-remaining">
                  <span>Remaining due</span>
                  <strong>{money(lastDuePayment.remainingDue)}</strong>
                </div>
              </div>
              <div className="receipt-employee">
                <span>Collected by</span>
                <b>
                  {lastDuePayment.employeeName} · {lastDuePayment.employeeId}
                </b>
                <small>
                  {lastDuePayment.date} · {lastDuePayment.time}
                </small>
              </div>
            </section>
            <div className="confirmation-actions">
              <button className="secondary-button" onClick={() => window.print()}>
                <Icon name="invoice" /> View Receipt
              </button>
              <button
                className="primary-button"
                onClick={() => setScreen(lastDuePayment.remainingDue > 0 ? "due-detail" : "dues")}
              >
                Done <Icon name="check" />
              </button>
            </div>
          </div>
        )}

        {screen === "advances" && (
          <div className="screen business-screen">
            <Header
              title="Advances"
              subtitle="Unused customer credit balances"
              onBack={() => setScreen("dashboard")}
              onMenu={() => setDrawerOpen(true)}
            />
            <section className="business-content">
              <div className="advance-overview">
                <div>
                  <span>Total Customer Advance</span>
                  <strong>{money(totalCustomerAdvance)}</strong>
                </div>
                <i />
                <div>
                  <span>Customers with Advance</span>
                  <strong>{advanceCustomers.length}</strong>
                </div>
              </div>

              <label className="search-field">
                <Icon name="search" size={19} />
                <input
                  value={advanceSearch}
                  onChange={(event) => setAdvanceSearch(event.target.value)}
                  placeholder="Search by name or phone"
                />
              </label>

              <div className="list-heading">
                <span>Active advances</span>
                <small>{filteredAdvanceCustomers.length} customers</small>
              </div>
              <div className="advance-customer-list">
                {filteredAdvanceCustomers.map((entry) => (
                  <button
                    className="advance-customer-row"
                    key={entry.id}
                    onClick={() => {
                      setSelectedAdvanceCustomerId(entry.id);
                      setScreen("advance-detail");
                    }}
                  >
                    <span className="customer-avatar advance-avatar">
                      {entry.name
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                    <span className="advance-customer-info">
                      <b>{entry.name}</b>
                      {entry.phone !== "Not provided" && <small>{entry.phone}</small>}
                      <em>
                        Latest activity · {entry.advanceHistory?.[0]?.date ?? entry.lastPurchase}
                      </em>
                    </span>
                    <span className="advance-customer-value">
                      <small>Available Advance</small>
                      <b>{money(entry.advance ?? 0)}</b>
                      <Icon name="chevron" size={16} />
                    </span>
                  </button>
                ))}
                {filteredAdvanceCustomers.length === 0 && (
                  <div className="empty-state">
                    <Icon name="wallet" />
                    <b>No active advances</b>
                    <p>No customers currently have unused advance balances.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {screen === "advance-detail" && selectedAdvanceCustomer && (
          <div className="screen business-screen detail-screen">
            <Header
              title="Advance Details"
              subtitle="Customer credit activity"
              onBack={() => setScreen("advances")}
              onHome={() => setScreen("dashboard")}
            />
            <section className="business-content">
              <div className="advance-detail-profile">
                <span className="customer-avatar large">
                  {selectedAdvanceCustomer.name
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <h2>{selectedAdvanceCustomer.name}</h2>
                {selectedAdvanceCustomer.phone !== "Not provided" && (
                  <p>{selectedAdvanceCustomer.phone}</p>
                )}
                <div>
                  <span>Current Available Advance</span>
                  <strong>{money(selectedAdvanceCustomer.advance ?? 0)}</strong>
                </div>
              </div>

              <div className="history-heading advance-history-heading">
                <h2>Advance transaction history</h2>
                <p>Added and used customer credit</p>
              </div>
              <div className="advance-history-list">
                {(selectedAdvanceCustomer.advanceHistory ?? []).map((transaction) => (
                  <article className="advance-history-row" key={transaction.id}>
                    <div className="advance-history-top">
                      <span
                        className={
                          transaction.amountAdded > 0
                            ? "advance-transaction-icon added"
                            : "advance-transaction-icon used"
                        }
                      >
                        <Icon name={transaction.amountAdded > 0 ? "plus" : "invoice"} size={18} />
                      </span>
                      <div>
                        <b>{transaction.amountAdded > 0 ? "Advance Added" : "Advance Used"}</b>
                        <time>{transaction.date}</time>
                      </div>
                      <strong className={transaction.amountAdded > 0 ? "added" : "used"}>
                        {transaction.amountAdded > 0 ? "+" : "−"}
                        {money(
                          transaction.amountAdded > 0
                            ? transaction.amountAdded
                            : transaction.amountUsed,
                        )}
                      </strong>
                    </div>
                    <div className="advance-history-details">
                      <div>
                        <span>Source or reason</span>
                        <b>{transaction.source}</b>
                      </div>
                      <div>
                        <span>Payment method</span>
                        <b>{transaction.method}</b>
                      </div>
                      <div>
                        <span>Amount added</span>
                        <b>{money(transaction.amountAdded)}</b>
                      </div>
                      <div>
                        <span>Advance used</span>
                        <b>{money(transaction.amountUsed)}</b>
                      </div>
                      <div className="advance-history-balance">
                        <span>Remaining advance</span>
                        <b>{money(transaction.remainingBalance)}</b>
                      </div>
                    </div>
                  </article>
                ))}
                {(selectedAdvanceCustomer.advanceHistory ?? []).length === 0 && (
                  <div className="empty-state">
                    <Icon name="invoice" />
                    <b>No advance transactions</b>
                    <p>Advance activity will appear here.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {screen === "stock" && (
          <div className="screen business-screen">
            <Header
              title="Stock"
              subtitle="Current sari inventory"
              onBack={() => setScreen("dashboard")}
              onMenu={() => setDrawerOpen(true)}
            />
            <section className="business-content">
              <div className="stock-overview">
                <div>
                  <span>Total pieces</span>
                  <strong>
                    {inventoryProducts.reduce((sum, product) => sum + product.quantity, 0)}
                  </strong>
                </div>
                <i />
                <div>
                  <span>Low stock</span>
                  <strong>
                    {inventoryProducts.filter((product) => product.quantity <= 3).length}
                  </strong>
                </div>
              </div>
              <label className="search-field">
                <Icon name="search" size={19} />
                <input
                  value={stockSearch}
                  onChange={(event) => setStockSearch(event.target.value)}
                  placeholder="Search sari products"
                />
              </label>
              <div className="filter-tabs">
                {(["All", "Low Stock"] as const).map((filter) => (
                  <button
                    key={filter}
                    className={stockFilter === filter ? "active" : ""}
                    onClick={() => setStockFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <div className="list-heading stock-list-heading">
                <span>Products</span>
                <button className="add-stock-button" onClick={startStockEntry}>
                  <Icon name="plus" size={16} /> Add Stock
                </button>
              </div>
              <div className="stock-list">
                {filteredStock.map((product) => {
                  const isLow = product.quantity <= 3;
                  return (
                    <button
                      className="stock-row"
                      key={product.id}
                      onClick={() => {
                        setSelectedStockId(product.id);
                        setScreen("stock-detail");
                      }}
                    >
                      <span
                        className="sari-swatch"
                        style={{ "--swatch": product.color } as CSSProperties}
                      >
                        <i />
                        <i />
                        <i />
                      </span>
                      <div className="stock-info">
                        <b>{product.name}</b>
                        <small>{product.detail}</small>
                        <em className={isLow ? "status low" : "status"}>
                          <i /> {isLow ? "Low Stock" : "In Stock"}
                        </em>
                      </div>
                      <div className="stock-count">
                        <strong>{product.quantity}</strong>
                        <small>pieces</small>
                      </div>
                    </button>
                  );
                })}
                {filteredStock.length === 0 && (
                  <div className="empty-state">
                    <Icon name="box" />
                    <b>No products found</b>
                    <p>Try changing your search or filter.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {screen === "add-stock" && (
          <div className="screen business-screen stock-entry-screen">
            <Header
              title="New Stock Entry"
              subtitle="Record a sari stock purchase"
              onBack={() => setScreen("stock")}
              onHome={() => setScreen("dashboard")}
            />
            <section className="business-content">
              <div className={canViewStockCosts ? "entry-mode-tabs" : "entry-mode-tabs single"}>
                <button
                  className={stockEntry.mode === "existing" ? "active" : ""}
                  onClick={() => {
                    const firstProduct = inventoryProducts[0];
                    setStockEntry((current) => ({
                      ...current,
                      mode: "existing",
                      productId: String(firstProduct.id),
                      name: firstProduct.name,
                      category: firstProduct.category,
                      buyingPrice: String(firstProduct.buyingPrice),
                      sellingPrice: String(firstProduct.sellingPrice),
                    }));
                    setStockEntryError("");
                  }}
                >
                  Existing product
                </button>
                {canViewStockCosts && (
                  <button
                    className={stockEntry.mode === "new" ? "active" : ""}
                    onClick={() => {
                      setStockEntry((current) => ({
                        ...current,
                        mode: "new",
                        productId: "",
                        name: "",
                        category: "",
                        buyingPrice: "",
                        sellingPrice: "",
                      }));
                      setStockEntryError("");
                    }}
                  >
                    New product
                  </button>
                )}
              </div>

              <div className="stock-entry-card">
                {stockEntry.mode === "existing" ? (
                  <label className="field">
                    <span>Product name</span>
                    <select
                      value={stockEntry.productId}
                      onChange={(event) => selectStockProduct(event.target.value)}
                    >
                      {inventoryProducts.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label className="field">
                    <span>Product name</span>
                    <input
                      className="plain-input"
                      value={stockEntry.name}
                      onChange={(event) => {
                        setStockEntry((current) => ({ ...current, name: event.target.value }));
                        setStockEntryError("");
                      }}
                      placeholder="Enter sari product name"
                    />
                  </label>
                )}

                <label className="field">
                  <span>Product category or type</span>
                  <input
                    className="plain-input"
                    value={stockEntry.category}
                    readOnly={stockEntry.mode === "existing"}
                    onChange={(event) =>
                      setStockEntry((current) => ({ ...current, category: event.target.value }))
                    }
                    placeholder="For example, Handwoven"
                  />
                </label>

                <div className="two-fields stock-entry-pair">
                  <label className="field compact">
                    <span>Quantity purchased</span>
                    <input
                      type="number"
                      min="1"
                      value={stockEntry.quantity}
                      onChange={(event) => {
                        setStockEntry((current) => ({ ...current, quantity: event.target.value }));
                        setStockEntryError("");
                      }}
                      placeholder="0"
                    />
                  </label>
                  <label className="field compact">
                    <span>Purchase date</span>
                    <input
                      type="date"
                      value={stockEntry.date}
                      onChange={(event) =>
                        setStockEntry((current) => ({ ...current, date: event.target.value }))
                      }
                    />
                  </label>
                </div>

                {canViewStockCosts && (
                  <label className="field">
                    <span>Buying price per piece</span>
                    <div className="amount-input compact-amount">
                      <b>BDT</b>
                      <input
                        type="number"
                        min="1"
                        value={stockEntry.buyingPrice}
                        onChange={(event) => {
                          setStockEntry((current) => ({
                            ...current,
                            buyingPrice: event.target.value,
                          }));
                          setStockEntryError("");
                        }}
                        placeholder="0"
                      />
                    </div>
                  </label>
                )}

                <label className="field">
                  <span>Selling price per piece</span>
                  <div className="amount-input compact-amount">
                    <b>BDT</b>
                    <input
                      type="number"
                      min="1"
                      value={stockEntry.sellingPrice}
                      onChange={(event) => {
                        setStockEntry((current) => ({
                          ...current,
                          sellingPrice: event.target.value,
                        }));
                        setStockEntryError("");
                      }}
                      placeholder="0"
                    />
                  </div>
                </label>

                <label className="field">
                  <span>Supplier name</span>
                  <div className="input-wrap">
                    <Icon name="store" size={19} />
                    <input
                      value={stockEntry.supplier}
                      onChange={(event) => {
                        setStockEntry((current) => ({ ...current, supplier: event.target.value }));
                        setStockEntryError("");
                      }}
                      placeholder="Enter supplier name"
                    />
                  </div>
                </label>

                {canViewStockCosts && (
                  <label className="field">
                    <span>
                      Transport or additional cost <small>Optional</small>
                    </span>
                    <div className="amount-input compact-amount">
                      <b>BDT</b>
                      <input
                        type="number"
                        min="0"
                        value={stockEntry.additionalCost}
                        onChange={(event) =>
                          setStockEntry((current) => ({
                            ...current,
                            additionalCost: event.target.value,
                          }))
                        }
                        placeholder="0"
                      />
                    </div>
                  </label>
                )}

                <label className="field stock-notes-field">
                  <span>
                    Notes <small>Optional</small>
                  </span>
                  <textarea
                    value={stockEntry.notes}
                    onChange={(event) =>
                      setStockEntry((current) => ({ ...current, notes: event.target.value }))
                    }
                    placeholder="Add purchase notes"
                    rows={3}
                  />
                </label>
              </div>

              {canViewStockCosts && (
                <div className="purchase-cost-card">
                  <div>
                    <span>Purchase subtotal</span>
                    <b>{money(stockPurchaseSubtotal)}</b>
                  </div>
                  <div>
                    <span>Additional cost</span>
                    <b>{money(Number(stockEntry.additionalCost) || 0)}</b>
                  </div>
                  <div className="purchase-total">
                    <span>Total purchase cost</span>
                    <strong>{money(stockPurchaseTotal)}</strong>
                  </div>
                </div>
              )}

              {stockEntryError && <p className="stock-entry-error">{stockEntryError}</p>}
              <button className="primary-button save-stock-button" onClick={saveStockEntry}>
                Save Stock Entry <Icon name="check" size={19} />
              </button>
            </section>
          </div>
        )}

        {screen === "stock-detail" && selectedStock && (
          <div className="screen business-screen detail-screen">
            <Header
              title="Stock Details"
              subtitle="Product inventory and purchase history"
              onBack={() => setScreen("stock")}
              onHome={() => setScreen("dashboard")}
            />
            <section className="business-content">
              <div className="stock-detail-profile">
                <span
                  className="sari-swatch large"
                  style={{ "--swatch": selectedStock.color } as CSSProperties}
                >
                  <i />
                  <i />
                  <i />
                </span>
                <div>
                  <p>{selectedStock.category}</p>
                  <h2>{selectedStock.name}</h2>
                  <em className={selectedStock.quantity <= 3 ? "status low" : "status"}>
                    <i /> {selectedStock.quantity <= 3 ? "Low Stock" : "In Stock"}
                  </em>
                </div>
              </div>

              <div className="stock-detail-stats">
                <div>
                  <span>Current quantity</span>
                  <strong>{selectedStock.quantity} pieces</strong>
                </div>
                {canViewStockCosts && (
                  <div>
                    <span>Buying price</span>
                    <strong>{money(selectedStock.buyingPrice)}</strong>
                  </div>
                )}
                <div>
                  <span>Selling price</span>
                  <strong>{money(selectedStock.sellingPrice)}</strong>
                </div>
              </div>

              <button
                className="primary-button detail-add-stock"
                onClick={() => {
                  setStockEntry({
                    mode: "existing",
                    productId: String(selectedStock.id),
                    name: selectedStock.name,
                    category: selectedStock.category,
                    quantity: "",
                    buyingPrice: String(selectedStock.buyingPrice),
                    sellingPrice: String(selectedStock.sellingPrice),
                    supplier: "",
                    date: "2025-05-24",
                    additionalCost: "",
                    notes: "",
                  });
                  setStockEntryError("");
                  setScreen("add-stock");
                }}
              >
                <Icon name="plus" size={19} /> Add More Stock
              </button>

              {canViewStockCosts && (
                <>
                  <div className="history-heading stock-history-heading">
                    <h2>Recent stock additions</h2>
                    <p>Most recent purchases first</p>
                  </div>
                  <div className="stock-addition-list">
                    {selectedStock.additions.map((addition) => (
                      <article className="stock-addition-row" key={addition.id}>
                        <span>
                          <Icon name="box" size={18} />
                        </span>
                        <div>
                          <b>+{addition.quantity} pieces</b>
                          <small>{addition.supplier}</small>
                          <time>{addition.date}</time>
                          {addition.notes && <em>{addition.notes}</em>}
                        </div>
                        <strong>{money(addition.totalCost)}</strong>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </section>
          </div>
        )}

        {screen === "staff" && accessMode === "Employee" && unlockedSection !== "staff" && (
          <div className="screen business-screen">
            <Header
              title="Staff & Payroll"
              subtitle="Protected payroll information"
              onBack={leaveProtectedSection}
              onMenu={() => setDrawerOpen(true)}
            />
            <section className="business-content">
              <div className="restricted-card">
                <Icon name="shield" size={30} />
                <h2>Owner access required</h2>
                <p>Employee salary, overtime, advances, and payroll payments are private.</p>
              </div>
            </section>
          </div>
        )}

        {screen === "staff" && (accessMode === "Owner" || unlockedSection === "staff") && (
          <div className="screen business-screen">
            <Header
              title="Staff & Payroll"
              subtitle="Team activity for May 2025"
              onBack={leaveProtectedSection}
              onMenu={() => setDrawerOpen(true)}
            />
            <section className="business-content">
              <div className="staff-summary-grid">
                <article className="staff-summary-card primary">
                  <span>
                    <Icon name="user" size={19} />
                  </span>
                  <small>Active employees</small>
                  <strong>{employees.length}</strong>
                </article>
                <article className="staff-summary-card">
                  <span>
                    <Icon name="clock" size={19} />
                  </span>
                  <small>Hours this month</small>
                  <strong>{totalStaffHours}</strong>
                </article>
                <article className="staff-summary-card payroll">
                  <div>
                    <span>
                      <Icon name="wallet" size={19} />
                    </span>
                    <small>Estimated monthly payroll</small>
                  </div>
                  <strong>{money(estimatedPayroll)}</strong>
                </article>
              </div>

              <div className="list-heading employee-list-heading">
                <span>Employees</span>
                <small>{employees.length} active</small>
              </div>
              <div className="employee-list">
                {employees.map((employee) => {
                  const status = employeeStatus(employee);
                  return (
                    <button
                      className="employee-row"
                      key={employee.id}
                      onClick={() => openEmployee(employee.id)}
                    >
                      <span className="employee-avatar">
                        {employee.name
                          .split(" ")
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                      <span className="employee-main">
                        <b>{employee.name}</b>
                        <small>
                          {employee.employeeId} · {employee.role}
                        </small>
                        <span className="employee-work">
                          <em>{employee.daysWorked} days</em>
                          <i />
                          <em>{employee.hoursWorked} hours</em>
                        </span>
                      </span>
                      <span className="employee-pay">
                        <b>{money(employee.salary)}</b>
                        <small>Monthly salary</small>
                        <em
                          className={`salary-status ${status === "Paid" ? "paid" : status === "Unpaid" ? "unpaid" : "partial"}`}
                        >
                          {status}
                        </em>
                      </span>
                      <Icon name="chevron" size={15} />
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {screen === "employee-detail" && selectedEmployee && (
          <div className="screen business-screen detail-screen">
            <Header
              title="Employee Details"
              subtitle="Work activity and salary"
              onBack={() => setScreen("staff")}
              onHome={() => setScreen("dashboard")}
            />
            <section className="business-content">
              <div className="employee-profile">
                <span className="employee-avatar large">
                  {selectedEmployee.name
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <h2>{selectedEmployee.name}</h2>
                <p>{selectedEmployee.role}</p>
                <div className="employee-contact">
                  <span>{selectedEmployee.employeeId}</span>
                  <i />
                  <span>{selectedEmployee.phone}</span>
                  <i />
                  <span>Joined {selectedEmployee.joiningDate}</span>
                </div>
              </div>

              <div className="work-stats">
                <div>
                  <span>
                    <Icon name="calendar" size={18} />
                  </span>
                  <small>Working days</small>
                  <strong>{selectedEmployee.daysWorked}</strong>
                </div>
                <div>
                  <span>
                    <Icon name="clock" size={18} />
                  </span>
                  <small>Total hours</small>
                  <strong>{selectedEmployee.hoursWorked}</strong>
                </div>
              </div>

              <section className="salary-card">
                <div className="salary-card-header">
                  <div>
                    <p>Salary summary</p>
                    <small>May 2025</small>
                  </div>
                  <em
                    className={`salary-status ${employeeStatus(selectedEmployee) === "Paid" ? "paid" : employeeStatus(selectedEmployee) === "Unpaid" ? "unpaid" : "partial"}`}
                  >
                    {employeeStatus(selectedEmployee)}
                  </em>
                </div>
                <div className="salary-lines">
                  <div>
                    <span>Regular salary</span>
                    <b>{money(selectedEmployee.salary)}</b>
                  </div>
                  <div>
                    <span>Overtime</span>
                    <b>+ {money(selectedEmployee.overtime)}</b>
                  </div>
                  <div>
                    <span>Salary advance</span>
                    <b>− {money(selectedEmployee.advance)}</b>
                  </div>
                  <div>
                    <span>Amount already paid</span>
                    <b>− {money(selectedEmployee.paid)}</b>
                  </div>
                </div>
                <div className="salary-remaining">
                  <span>Remaining salary</span>
                  <strong>{money(employeeRemaining(selectedEmployee))}</strong>
                </div>
              </section>

              <div className="employee-actions">
                <button onClick={() => startEmployeeAction("attendance")}>
                  <span>
                    <Icon name="calendar" size={19} />
                  </span>
                  <b>Record Attendance</b>
                </button>
                <button onClick={() => startEmployeeAction("hours")}>
                  <span>
                    <Icon name="clock" size={19} />
                  </span>
                  <b>Add Working Hours</b>
                </button>
                <button
                  onClick={() => startEmployeeAction("salary")}
                  disabled={employeeRemaining(selectedEmployee) === 0}
                >
                  <span>
                    <Icon name="wallet" size={19} />
                  </span>
                  <b>Record Salary Payment</b>
                </button>
              </div>

              {employeeAction && (
                <div className="employee-action-panel">
                  <div className="section-heading">
                    <div>
                      <h2>
                        {employeeAction === "attendance"
                          ? "Record Attendance"
                          : employeeAction === "hours"
                            ? "Add Working Hours"
                            : "Record Salary Payment"}
                      </h2>
                      <p>
                        {employeeAction === "attendance"
                          ? "Add today to this month’s attendance"
                          : employeeAction === "hours"
                            ? "Enter additional hours worked"
                            : `Remaining salary: ${money(employeeRemaining(selectedEmployee))}`}
                      </p>
                    </div>
                    <button onClick={() => setEmployeeAction(null)}>Cancel</button>
                  </div>
                  {employeeAction !== "attendance" && (
                    <label className="field compact employee-action-input">
                      <span>{employeeAction === "hours" ? "Hours worked" : "Payment amount"}</span>
                      <div className={employeeAction === "salary" ? "amount-input" : "input-wrap"}>
                        {employeeAction === "salary" && <b>BDT</b>}
                        {employeeAction === "hours" && <Icon name="clock" size={19} />}
                        <input
                          autoFocus
                          type="number"
                          min="1"
                          max={
                            employeeAction === "salary"
                              ? employeeRemaining(selectedEmployee)
                              : undefined
                          }
                          value={employeeEntry}
                          onChange={(event) => setEmployeeEntry(event.target.value)}
                          placeholder={employeeAction === "hours" ? "Enter hours" : "0"}
                        />
                      </div>
                    </label>
                  )}
                  <button
                    className="primary-button"
                    onClick={saveEmployeeAction}
                    disabled={employeeAction !== "attendance" && !Number(employeeEntry)}
                  >
                    {employeeAction === "attendance" ? "Confirm Attendance" : "Save Update"}
                    <Icon name="check" size={18} />
                  </button>
                </div>
              )}
            </section>
          </div>
        )}

        {screen === "new-sale" && (
          <div className="screen form-screen">
            <Header
              title="New Sale"
              subtitle="Start a new customer invoice"
              onBack={() => setScreen("dashboard")}
              onMenu={() => setDrawerOpen(true)}
            />
            <Progress step={1} />
            <section className="form-content">
              <label className="field">
                <span>Date</span>
                <div className="input-wrap">
                  <Icon name="calendar" size={20} />
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </label>
              <label className="field">
                <span>
                  Customer name <small>Optional</small>
                </span>
                <div className="input-wrap">
                  <Icon name="user" size={20} />
                  <input
                    placeholder="Enter customer name"
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                  />
                </div>
                <em>Required only if payment is due</em>
              </label>
              <fieldset>
                <legend>Sale source</legend>
                <div className="source-grid">
                  {(["Store Sale", "Home Sale"] as SaleSource[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={source === option ? "source active" : "source"}
                      onClick={() => setSource(option)}
                    >
                      <span>
                        <Icon name={option === "Store Sale" ? "store" : "home"} />
                      </span>
                      <b>{option}</b>
                      <i>
                        <Icon name="check" size={14} />
                      </i>
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="info-note">
                <span>1</span>
                <p>Next, add one or more sari items to this invoice.</p>
              </div>
            </section>
            <div className="sticky-action">
              <button className="primary-button" onClick={startItems}>
                Add products <Icon name="chevron" />
              </button>
            </div>
          </div>
        )}

        {screen === "items" && (
          <div className="screen form-screen">
            <Header
              title="Add Items"
              subtitle={`${customer || "Walk-in customer"} · ${source}`}
              onBack={() => setScreen("new-sale")}
            />
            <Progress step={2} />
            <section className="form-content item-content">
              <div className="section-heading">
                <div>
                  <h2>Invoice items</h2>
                  <p>
                    {items.length} {items.length === 1 ? "item" : "items"} added
                  </p>
                </div>
              </div>
              {items.map((item, index) => (
                <article className="item-card" key={item.id}>
                  <div className="item-number">{String(index + 1).padStart(2, "0")}</div>
                  <label className="field compact">
                    <span>Sari type</span>
                    <select
                      value={item.product}
                      onChange={(e) => {
                        const product = inventoryProducts.find(
                          (entry) => entry.name === e.target.value,
                        )!;
                        updateItem(item.id, {
                          product: product.name,
                          price: product.sellingPrice,
                        });
                      }}
                    >
                      {inventoryProducts.map((product) => (
                        <option key={product.name}>{product.name}</option>
                      ))}
                    </select>
                  </label>
                  <div className="two-fields">
                    <label className="field compact">
                      <span>Quantity</span>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(item.id, { quantity: Math.max(1, Number(e.target.value)) })
                        }
                      />
                    </label>
                    <label className="field compact">
                      <span>Selling price</span>
                      <div className="currency-input">
                        <b>BDT</b>
                        <input
                          type="number"
                          min="0"
                          value={item.price}
                          onChange={(e) =>
                            updateItem(item.id, { price: Math.max(0, Number(e.target.value)) })
                          }
                        />
                      </div>
                    </label>
                  </div>
                  <div className="item-subtotal">
                    <span>Item subtotal</span>
                    <b>{money(item.quantity * item.price)}</b>
                  </div>
                  {items.length > 1 && (
                    <button
                      className="remove-item"
                      onClick={() =>
                        setItems((current) => current.filter((row) => row.id !== item.id))
                      }
                    >
                      Remove
                    </button>
                  )}
                </article>
              ))}
              <button
                className="add-another"
                onClick={() => addProduct(items.length === 1 ? "Silk" : "Manipuri")}
              >
                <Icon name="plus" /> Add another item
              </button>
            </section>
            <div className="total-footer">
              <div>
                <span>Running total</span>
                <strong>{money(total)}</strong>
              </div>
              <button
                className="primary-button"
                onClick={continueToPayment}
                disabled={!items.length}
              >
                Continue <Icon name="chevron" />
              </button>
            </div>
          </div>
        )}

        {screen === "payment" && (
          <div className="screen form-screen">
            <Header
              title="Payment"
              subtitle="Record payment details"
              onBack={() => setScreen("items")}
            />
            <Progress step={3} />
            <section className="form-content">
              <div className="payment-total">
                <span>Invoice total</span>
                <strong>{money(total)}</strong>
                <small>
                  {items.length} sari {items.length === 1 ? "item" : "items"}
                </small>
              </div>
              <label className="field">
                <span>Paid amount</span>
                <div className="amount-input">
                  <b>BDT</b>
                  <input
                    type="number"
                    min="0"
                    value={paid}
                    onChange={(e) => {
                      setPaid(e.target.value);
                      setExcessOption("");
                      setAdvanceToApply("");
                      setError("");
                    }}
                  />
                </div>
              </label>

              {availableAdvance > 0 && (
                <div className="available-advance-card">
                  <div>
                    <span>Available Advance</span>
                    <strong>{money(availableAdvance)}</strong>
                  </div>
                  <label>
                    <span>Advance to apply</span>
                    <div>
                      <b>BDT</b>
                      <input
                        type="number"
                        min="0"
                        max={maximumAdvanceUse}
                        value={advanceToApply}
                        disabled={maximumAdvanceUse === 0}
                        onChange={(event) => {
                          const value = Math.min(
                            Number(event.target.value) || 0,
                            maximumAdvanceUse,
                          );
                          setAdvanceToApply(value ? String(value) : "");
                        }}
                        placeholder="0"
                      />
                    </div>
                  </label>
                  <button
                    onClick={() => {
                      const advanceAmount = Math.min(availableAdvance, total);
                      setPaid(String(Math.max(total - advanceAmount, 0)));
                      setAdvanceToApply(String(advanceAmount));
                      setExcessOption("");
                    }}
                    disabled={total === 0}
                  >
                    Apply available
                  </button>
                </div>
              )}

              {excessAmount > 0 ? (
                <div className="excess-payment-section">
                  <div className="excess-total">
                    <span>Excess Amount</span>
                    <strong>{money(excessAmount)}</strong>
                  </div>
                  <fieldset>
                    <legend>
                      Handle excess payment <b className="required">Required</b>
                    </legend>
                    <div className="excess-options">
                      <button
                        className={excessOption === "return" ? "active" : ""}
                        onClick={() => {
                          setExcessOption("return");
                          setError("");
                        }}
                      >
                        <span>
                          <Icon name="wallet" size={20} />
                        </span>
                        <div>
                          <b>Return Change</b>
                          <small>Change to return: {money(excessAmount)}</small>
                        </div>
                        <i>{excessOption === "return" && <Icon name="check" size={13} />}</i>
                      </button>
                      <button
                        className={excessOption === "advance" ? "active" : ""}
                        onClick={() => {
                          setExcessOption("advance");
                          setError("");
                        }}
                      >
                        <span>
                          <Icon name="user" size={20} />
                        </span>
                        <div>
                          <b>Keep as Customer Advance</b>
                          <small>Save {money(excessAmount)} for future purchases</small>
                        </div>
                        <i>{excessOption === "advance" && <Icon name="check" size={13} />}</i>
                      </button>
                    </div>
                  </fieldset>
                </div>
              ) : (
                <div className="due-row">
                  <span>Remaining due</span>
                  <strong className={due > 0 ? "has-due" : ""}>{money(due)}</strong>
                </div>
              )}

              {(due > 0 || excessOption === "advance") && (
                <label className="field">
                  <span>
                    Customer name <b className="required">Required</b>
                  </span>
                  <div className="input-wrap">
                    <Icon name="user" size={20} />
                    <input
                      placeholder="Enter customer name"
                      value={customer}
                      onChange={(e) => {
                        setCustomer(e.target.value);
                        setAdvanceToApply("");
                        setError("");
                      }}
                    />
                  </div>
                  {error && <em className="error">{error}</em>}
                </label>
              )}
              <fieldset>
                <legend>Payment method</legend>
                <div className="method-list">
                  {(["Cash", "Bank Transfer", "bKash", "Nagad"] as PaymentMethod[]).map(
                    (option) => (
                      <button
                        key={option}
                        className={method === option ? "method active" : "method"}
                        onClick={() => setMethod(option)}
                      >
                        <span>
                          <Icon name={option === "Cash" ? "wallet" : "card"} />
                        </span>
                        <b>{option}</b>
                        <i>{method === option && <Icon name="check" size={14} />}</i>
                      </button>
                    ),
                  )}
                </div>
              </fieldset>
            </section>
            <div className="sticky-action">
              <button
                className="primary-button"
                onClick={confirmSale}
                disabled={excessAmount > 0 && !excessOption}
              >
                Confirm sale <Icon name="check" />
              </button>
            </div>
          </div>
        )}

        {screen === "confirmation" && (
          <div className="screen confirmation-screen">
            <Progress step={4} />
            <div className="success-mark">
              <span>
                <Icon name="check" size={34} />
              </span>
            </div>
            <p className="eyebrow">Sale recorded</p>
            <h1>Sale confirmed</h1>
            <p className="success-copy">The invoice has been saved successfully.</p>
            <section className="receipt">
              <div className="receipt-top">
                <span className="mini-seal">M</span>
                <div>
                  <b>Mukti Saree</b>
                  <small>{invoiceId}</small>
                </div>
                <time>{date.split("-").reverse().join("/")}</time>
              </div>
              <div className="receipt-meta">
                <div>
                  <span>Customer</span>
                  <b>{customer || "Walk-in customer"}</b>
                </div>
                <div>
                  <span>Sale source</span>
                  <b>{source}</b>
                </div>
              </div>
              <div className="receipt-items">
                {items.map((item) => (
                  <div key={item.id}>
                    <span>
                      <b>{item.product}</b>
                      <small>
                        {item.quantity} × {money(item.price)}
                      </small>
                    </span>
                    <strong>{money(item.quantity * item.price)}</strong>
                  </div>
                ))}
              </div>
              <div className="receipt-totals">
                <div>
                  <span>Total</span>
                  <b>{money(total)}</b>
                </div>
                <div>
                  <span>Paid · {method}</span>
                  <b>{money(paidAmount)}</b>
                </div>
                {appliedAdvance > 0 && (
                  <div>
                    <span>Advance Applied</span>
                    <b>{money(appliedAdvance)}</b>
                  </div>
                )}
                {excessOption === "return" && excessAmount > 0 && (
                  <div>
                    <span>Change Returned</span>
                    <b>{money(excessAmount)}</b>
                  </div>
                )}
                {excessOption === "advance" && excessAmount > 0 && (
                  <div>
                    <span>Customer Advance</span>
                    <b>{money(excessAmount)}</b>
                  </div>
                )}
                <div className="due-total">
                  <span>Due</span>
                  <b>{money(due)}</b>
                </div>
              </div>
            </section>
            <div className="confirmation-actions">
              <button className="secondary-button" onClick={() => window.print()}>
                <Icon name="invoice" /> View Invoice
              </button>
              <button className="primary-button" onClick={() => setScreen("dashboard")}>
                Done <Icon name="check" />
              </button>
            </div>
          </div>
        )}
      </section>
      {drawerOpen && (
        <div className="drawer-layer" role="dialog" aria-modal="true" aria-label="Main navigation">
          <button
            className="drawer-backdrop"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation"
          />
          <aside className="navigation-drawer">
            <div className="drawer-brand">
              <span className="mini-seal">M</span>
              <div>
                <h2>Mukti Saree</h2>
                <p>Shop Management</p>
              </div>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close navigation">
                <Icon name="close" size={21} />
              </button>
            </div>
            <div className="workspace-card">
              <span>
                <Icon name="store" size={20} />
              </span>
              <div>
                <b>Mukti Saree Shop</b>
                <small>Bangladesh Store</small>
              </div>
              <Icon name="chevron" size={16} />
            </div>
            {accessMode === "Employee" && (
              <div className="drawer-employee-card">
                <span className="employee-avatar">
                  {currentEmployee.name
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <div>
                  <b>{currentEmployee.name}</b>
                  <small>{currentEmployee.employeeId} · Employee account</small>
                </div>
              </div>
            )}
            <p className="drawer-label">WORKSPACE</p>
            <nav className="drawer-nav">
              {(accessMode === "Employee"
                ? [
                    { id: "overview", label: "Overview", icon: "home" as IconName },
                    { id: "new-sale", label: "New Sale", icon: "plus" as IconName },
                    { id: "inventory", label: "Inventory", icon: "box" as IconName },
                    { id: "stock-entry", label: "Stock Entry", icon: "store" as IconName },
                    {
                      id: "dues",
                      label: "Customer Dues",
                      icon: "wallet" as IconName,
                      protected: !employeePermissions[currentEmployee.id].dueCollection,
                    },
                    {
                      id: "transactions",
                      label: "My Transactions",
                      icon: "invoice" as IconName,
                    },
                    {
                      id: "my-attendance",
                      label: "My Attendance",
                      icon: "calendar" as IconName,
                    },
                    {
                      id: "clock",
                      label: activeClockSession ? "Clock Out" : "Clock In / Clock Out",
                      icon: "clock" as IconName,
                    },
                  ]
                : [
                    { id: "overview", label: "Overview", icon: "home" as IconName },
                    { id: "new-sale", label: "New Sale", icon: "plus" as IconName },
                    { id: "inventory", label: "Inventory", icon: "box" as IconName },
                    { id: "transactions", label: "Transactions", icon: "invoice" as IconName },
                    { id: "customers", label: "Customers", icon: "users" as IconName },
                    { id: "dues", label: "Customer Dues", icon: "wallet" as IconName },
                    { id: "advances", label: "Customer Advances", icon: "card" as IconName },
                    {
                      id: "staff",
                      label: "Staff & Payroll",
                      icon: "user" as IconName,
                      protected: true,
                    },
                    {
                      id: "profit",
                      label: "Profit & Costs",
                      icon: "chart" as IconName,
                      protected: true,
                    },
                    {
                      id: "backups",
                      label: "Backups",
                      icon: "database" as IconName,
                      protected: true,
                    },
                    {
                      id: "access",
                      label: "Access",
                      icon: "shield" as IconName,
                      protected: true,
                    },
                  ]
              ).map((item) => (
                <button
                  key={item.id}
                  className={`${isSectionActive(item.id) ? "active" : ""} ${
                    accessMode === "Employee" && "protected" in item && item.protected
                      ? "locked"
                      : ""
                  }`}
                  onClick={() => openSection(item.id)}
                >
                  <span>
                    <Icon name={item.icon} size={19} />
                  </span>
                  <b>{item.label}</b>
                  <Icon
                    name={
                      accessMode === "Employee" && "protected" in item && item.protected
                        ? "shield"
                        : "chevron"
                    }
                    size={14}
                  />
                </button>
              ))}
            </nav>
            <div className="drawer-footer">
              <span>
                <Icon name="shield" size={18} />
              </span>
              <div>
                <b>Private Workspace</b>
                <small>Bangladesh Time · BDT</small>
              </div>
              <em>{accessMode}</em>
            </div>
          </aside>
        </div>
      )}
      {protectedTarget && (
        <div
          className="password-modal-layer"
          role="dialog"
          aria-modal="true"
          aria-label="Owner password"
        >
          <button
            className="password-modal-backdrop"
            onClick={() => setProtectedTarget(null)}
            aria-label="Cancel password entry"
          />
          <div className="password-modal">
            <span className="password-lock">
              <Icon name="shield" size={25} />
            </span>
            <p className="eyebrow">Protected Area</p>
            <h2>Owner / Admin Password</h2>
            <p>Enter the owner password to continue to this protected section.</p>
            <small className="password-hint">Prototype password: 1234</small>
            <label>
              <span>Password</span>
              <input
                autoFocus
                type="password"
                inputMode="numeric"
                value={ownerPassword}
                onChange={(event) => {
                  setOwnerPassword(event.target.value);
                  setPasswordError("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") verifyOwnerPassword();
                }}
                placeholder="Enter password"
              />
              {passwordError && <em>{passwordError}</em>}
            </label>
            <div>
              <button
                className="secondary-button"
                onClick={() => {
                  setProtectedTarget(null);
                  setOwnerPassword("");
                  setPasswordError("");
                }}
              >
                Cancel
              </button>
              <button className="primary-button" onClick={verifyOwnerPassword}>
                Unlock <Icon name="check" size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
