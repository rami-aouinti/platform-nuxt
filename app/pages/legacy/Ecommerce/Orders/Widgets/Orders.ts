import imageTeam2 from "@/assets/img/team-2.jpg";
import imageTeam1 from "@/assets/img/team-1.jpg";
import imageTeam3 from "@/assets/img/team-3.jpg";
import imageTeam4 from "@/assets/img/team-4.jpg";
import imageTeam5 from "@/assets/img/team-5.jpg";
import imageIvanaSquares from "@/assets/img/ivana-squares.jpg";

export interface OrderRow {
  id: string;
  checkbox: boolean;
  date: string;
  status: string;
  statusIcon: string;
  customer: string;
  customerImg?: string;
  product: string;
  revenue: string;
}

export const orders: OrderRow[] = [
  {
    id: "#10421",
    checkbox: false,
    date: "1 Nov, 10:20 AM",
    status: "Paid",
    statusIcon: "fas fa-check",
    customer: "Orlando Imieto",
    customerImg: imageTeam2,
    product: "Nike Sport V2",
    revenue: "$140,20",
  },
  {
    id: "#10422",
    checkbox: false,
    date: "1 Nov, 10:53 AM",
    status: "Paid",
    statusIcon: "fas fa-check",
    customer: "Alice Murinho",
    customerImg: imageTeam1,
    product: "Valvet T-shirt2",
    revenue: "$42,00",
  },
  {
    id: "#10423",
    checkbox: false,
    date: "1 Nov, 11:13 AM",
    status: "Refunded",
    statusIcon: "fas fa-undo",
    customer: "Michael Mirra",
    product: "Leather Wallet",
    revenue: "$25,50",
  },
  {
    id: "#10424",
    checkbox: false,
    date: "1 Nov, 12:20 PM",
    status: "Paid",
    statusIcon: "fas fa-check",
    customer: "Andrew Nichel",
    customerImg: imageTeam3,
    product: "Bracelet Onu-Lino",
    revenue: "$19,40",
  },
  {
    id: "#10425",
    checkbox: false,
    date: "1 Nov, 1:40 PM",
    status: "Canceled",
    statusIcon: "fas fa-times",
    customer: "Sebastian Koga",
    customerImg: imageTeam4,
    product: "Phone Case Pink",
    revenue: "$44,90",
  },
  {
    id: "#10426",
    checkbox: false,
    date: "1 Nov, 2:19 AM",
    status: "Paid",
    statusIcon: "fas fa-check",
    customer: "Laur Gilbert",
    product: "Backpack Niver",
    revenue: "$112,50",
  },
  {
    id: "#10427",
    checkbox: false,
    date: "1 Nov, 3:42 AM",
    status: "Paid",
    statusIcon: "fas fa-check",
    customer: "Iryna Innda",
    product: "Adidas Vio",
    revenue: "$200,00",
  },
  {
    id: "#10428",
    checkbox: false,
    date: "2 Nov, 9:32 AM",
    status: "Paid",
    statusIcon: "fas fa-check",
    customer: "Arrias Liunda",
    product: "Airpods 2 Gen",
    revenue: "$350,00",
  },
  {
    id: "#10429",
    checkbox: false,
    date: "2 Nov, 10:14 AM",
    status: "Paid",
    statusIcon: "fas fa-check",
    customer: "Rugna Ilpio",
    customerImg: imageTeam5,
    product: "Bracelet Warret",
    revenue: "$15,00",
  },
  {
    id: "#10430",
    checkbox: false,
    date: "2 Nov, 12:56 PM",
    status: "Refunded",
    statusIcon: "fas fa-undo",
    customer: "Anna Landa",
    customerImg: imageIvanaSquares,
    product: "Watter Bottle India",
    revenue: "$25,00",
  },
  {
    id: "#10431",
    checkbox: false,
    date: "2 Nov, 3:12 PM",
    status: "Paid",
    statusIcon: "fas fa-check",
    customer: "Karl Innas",
    product: "Kitchen Gadgets",
    revenue: "$164,90",
  },
  {
    id: "#10432",
    checkbox: false,
    date: "2 Nov, 5:12 PM",
    status: "Paid",
    statusIcon: "fas fa-check",
    customer: "Oana Kilas",
    product: "Office Papers",
    revenue: "$23,90",
  },
];

export default orders;
