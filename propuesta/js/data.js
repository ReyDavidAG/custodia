export const TODAY = "2026-11-02";

export const types = {
  laptop: { label: "Laptop", group: "hardware", icon: "laptop" },
  monitor: { label: "Monitor", group: "hardware", icon: "monitor" },
  phone: { label: "Celular", group: "hardware", icon: "phone" },
  printer: { label: "Impresora", group: "hardware", icon: "printer" },
  accessory: { label: "Accesorio", group: "hardware", icon: "plug" },
  license: { label: "Licencia", group: "license", icon: "key" },
};

export const statuses = {
  stock: "En almacén",
  assigned: "Asignado",
  repair: "En reparación",
  retired: "Dado de baja",
  trueque: "En El Trueque",
};

export const people = [
  { id: "p1", number: "20001", name: "Mariana Ruiz", position: "Analista de calidad", area: "Calidad" },
  { id: "p2", number: "20002", name: "Jorge Medina", position: "Coordinador de compras", area: "Compras" },
  { id: "p3", number: "20003", name: "Laura Ponce", position: "Soporte técnico", area: "Sistemas" },
  { id: "p4", number: "20004", name: "Ricardo Salas", position: "Contador general", area: "Contabilidad" },
  { id: "p5", number: "20005", name: "Fernanda Gil", position: "Supervisora de logística", area: "Logística" },
  { id: "p6", number: "20006", name: "Tomás Ibarra", position: "Ingeniero de procesos", area: "Producción" },
];

export const profiles = [
  { number: "20001", role: "member" },
  { number: "20003", role: "it" },
  { number: "20004", role: "accounting" },
];

export const roleNames = { member: "Colaborador", it: "Soporte de IT", accounting: "Contabilidad" };

const h = (date, kind, extra = {}) => ({ date, kind, ...extra });

export const assets = [
  {
    folio: "EQ-0412", type: "laptop", brand: "Lenovo", model: "ThinkPad E14", serial: "PF3K9A21", bought: "2021-03-15", warranty: "2024-03-15", value: 18500,
    status: "trueque", holder: null, parts: ["Cargador"],
    history: [h("2021-03-20", "in"), h("2021-03-22", "handover", { person: "p2", res: "RES-0118" }), h("2025-10-30", "return", { person: "p2", res: "RES-0118", note: "Batería al 60 %" }), h("2026-09-02", "retire", { note: "IT borró datos" }), h("2026-09-20", "accounting"), h("2026-10-01", "trueque", { note: "Publicada por 450 cacaos" })],
  },
  {
    folio: "EQ-0398", type: "monitor", brand: "Dell", model: "P2422H 24\"", serial: "CN0D2P8K", bought: "2020-06-02", warranty: "2023-06-02", value: 4200,
    status: "retired", holder: null, parts: ["Cable DisplayPort"], retire: { it: true, accounting: true },
    history: [h("2020-06-05", "in"), h("2020-06-08", "handover", { person: "p5", res: "RES-0091" }), h("2026-07-14", "return", { person: "p5", res: "RES-0091" }), h("2026-08-03", "retire", { note: "Pixeles muertos en una esquina" }), h("2026-08-20", "accounting")],
  },
  {
    folio: "EQ-0405", type: "laptop", brand: "HP", model: "ProBook 430 G6", serial: "5CD9471K", bought: "2019-08-10", warranty: "2022-08-10", value: 16200,
    status: "retired", holder: null, parts: ["Cargador"], retire: { it: true, accounting: false },
    history: [h("2019-08-12", "in"), h("2019-08-14", "handover", { person: "p6", res: "RES-0064" }), h("2026-09-28", "return", { person: "p6", res: "RES-0064" }), h("2026-10-12", "retire", { note: "IT borró datos" })],
  },
  {
    folio: "EQ-0451", type: "laptop", brand: "Dell", model: "Latitude 5440", serial: "7HQ2LM3", bought: "2025-02-11", warranty: "2028-02-11", value: 24800,
    status: "assigned", holder: "p1", res: "RES-0204", parts: ["Cargador", "Mouse inalámbrico", "Funda"],
    history: [h("2025-02-14", "in"), h("2025-02-17", "handover", { person: "p1", res: "RES-0204" })],
  },
  {
    folio: "EQ-0452", type: "monitor", brand: "Dell", model: "P2423 24\"", serial: "CN0VX81Q", bought: "2025-02-11", warranty: "2028-02-11", value: 4600,
    status: "assigned", holder: "p1", res: "RES-0204", parts: ["Cable HDMI"],
    history: [h("2025-02-14", "in"), h("2025-02-17", "handover", { person: "p1", res: "RES-0204" })],
  },
  {
    folio: "LIC-0031", type: "license", brand: "Microsoft", model: "Office 365 E3", serial: "Cuenta de correo", bought: "2025-01-01", warranty: "2026-12-31", value: 0,
    status: "assigned", holder: "p1", res: "RES-0204", parts: [],
    history: [h("2025-02-17", "handover", { person: "p1", res: "RES-0204" })],
  },
  {
    folio: "EQ-0460", type: "phone", brand: "Samsung", model: "Galaxy A55", serial: "R58X20KQ", bought: "2025-09-01", warranty: "2026-09-01", value: 7800,
    status: "assigned", holder: "p5", res: "RES-0231", parts: ["Cargador", "Funda"],
    history: [h("2025-09-03", "in"), h("2025-09-04", "handover", { person: "p5", res: "RES-0231" })],
  },
  {
    folio: "EQ-0463", type: "laptop", brand: "Lenovo", model: "ThinkPad T14 G4", serial: "PF4TR92B", bought: "2026-04-18", warranty: "2029-04-18", value: 27900,
    status: "stock", holder: null, parts: ["Cargador"],
    history: [h("2026-04-22", "in")],
  },
  {
    folio: "EQ-0464", type: "laptop", brand: "Lenovo", model: "ThinkPad T14 G4", serial: "PF4TR95C", bought: "2026-04-18", warranty: "2029-04-18", value: 27900,
    status: "stock", holder: null, parts: ["Cargador"],
    history: [h("2026-04-22", "in")],
  },
  {
    folio: "EQ-0470", type: "monitor", brand: "LG", model: "27MP400 27\"", serial: "308NTKF2", bought: "2026-06-30", warranty: "2028-06-30", value: 3900,
    status: "stock", holder: null, parts: ["Cable HDMI"],
    history: [h("2026-07-02", "in")],
  },
  {
    folio: "EQ-0433", type: "printer", brand: "Brother", model: "HL-L5100DN", serial: "E78213J4", bought: "2023-11-08", warranty: "2025-11-08", value: 6400,
    status: "repair", holder: null, parts: [],
    history: [h("2023-11-10", "in"), h("2023-11-13", "handover", { person: "p2", res: "RES-0172" }), h("2026-10-20", "repair", { note: "Atasco de papel recurrente" })],
  },
  {
    folio: "LIC-0044", type: "license", brand: "Adobe", model: "Acrobat Pro", serial: "Licencia de usuario", bought: "2026-01-01", warranty: "2026-12-31", value: 0,
    status: "stock", holder: null, parts: [],
    history: [h("2026-01-05", "in")],
  },
];

export const requests = [
  { folio: "SOL-0057", person: "p6", type: "laptop", reason: "Me dieron de alta en el equipo de mejora continua y trabajo en piso; la de escritorio no me sirve.", date: "2026-10-29", status: "pending" },
  { folio: "SOL-0056", person: "p2", type: "monitor", reason: "Monitor adicional para conciliar órdenes de compra.", date: "2026-10-27", status: "pending" },
  { folio: "SOL-0052", person: "p1", type: "accessory", reason: "Se rompió el mouse.", date: "2026-10-14", status: "delivered" },
];
