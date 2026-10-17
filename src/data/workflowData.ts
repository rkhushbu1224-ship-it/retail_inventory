import {
  WorkflowRequest,
  WorkflowNotification,
  WorkflowProductCategory,
  WorkflowStatus,
  WorkflowRequestType,
  User,
  UserRole,
} from '../types';

export interface StoreCatalogItem {
  id: string;
  storeId: string;
  storeName: string;
  category: WorkflowProductCategory;
  productName: string;
  model: string;
  make: string;
  availableQty: number;
  specs: string;
  status: 'In-Stock' | 'Low-Stock' | 'Reserved';
}

export const INITIAL_STORE_CATALOG: StoreCatalogItem[] = [
  // State Central IT Store (store-1)
  {
    id: 'cat-item-1',
    storeId: 'store-1',
    storeName: 'State Central IT Store',
    category: 'Hardware',
    productName: 'Dell Latitude 5440 Laptop',
    model: 'Latitude 5440',
    make: 'Dell',
    availableQty: 18,
    specs: 'Intel Core i7 13th Gen, 16GB RAM, 512GB SSD, 14" FHD Antiglare',
    status: 'In-Stock',
  },
  {
    id: 'cat-item-2',
    storeId: 'store-1',
    storeName: 'State Central IT Store',
    category: 'Hardware',
    productName: 'HP LaserJet Pro Enterprise MFP 4104fdw',
    model: 'LaserJet 4104fdw',
    make: 'HP',
    availableQty: 7,
    specs: 'Duplex Printing, ADF Scanner, Network Ethernet, 40 PPM',
    status: 'In-Stock',
  },
  {
    id: 'cat-item-3',
    storeId: 'store-1',
    storeName: 'State Central IT Store',
    category: 'Hardware',
    productName: 'Dell UltraSharp 27" 4K USB-C Monitor',
    model: 'U2723QE',
    make: 'Dell',
    availableQty: 12,
    specs: '4K UHD IPS Black, 90W Power Delivery Hub, Height Adjustable',
    status: 'In-Stock',
  },
  {
    id: 'cat-item-4',
    storeId: 'store-1',
    storeName: 'State Central IT Store',
    category: 'Furniture',
    productName: 'Godrej Interio High-Back Ergonomic Executive Chair',
    model: 'Motion Plus',
    make: 'Godrej',
    availableQty: 25,
    specs: 'Breathable Mesh Back, 3D Armrest, Synchro-tilt Lock, Lumbar Support',
    status: 'In-Stock',
  },
  {
    id: 'cat-item-5',
    storeId: 'store-1',
    storeName: 'State Central IT Store',
    category: 'Furniture',
    productName: 'Heavy-Gauge Steel Almirah (4-Shelf)',
    model: 'Storewell Plain',
    make: 'Godrej',
    availableQty: 9,
    specs: 'CRCA Heavy Steel Sheet, 3-Way Bolting Lock, Scratch Resistant Paint',
    status: 'In-Stock',
  },
  {
    id: 'cat-item-6',
    storeId: 'store-1',
    storeName: 'State Central IT Store',
    category: 'Networking',
    productName: 'Cisco Catalyst 24-Port Gigabit Managed Switch',
    model: 'C1000-24T-4G-L',
    make: 'Cisco',
    availableQty: 5,
    specs: '24x 10/100/1000 Ports, 4x SFP Uplinks, Fanless Silent Design',
    status: 'In-Stock',
  },
  {
    id: 'cat-item-7',
    storeId: 'store-1',
    storeName: 'State Central IT Store',
    category: 'Stationery',
    productName: 'GFR-2017 Asset Register & Stock Ledger Book',
    model: 'GFR Form-22 Hardbound',
    make: 'Khushbu Press',
    availableQty: 40,
    specs: '300 Folio Pages, Acid-Free Bond Paper, Leatherette Binding',
    status: 'In-Stock',
  },

  // Vikas Bhawan IT Sub-Store (store-2)
  {
    id: 'cat-item-8',
    storeId: 'store-2',
    storeName: 'Vikas Bhawan IT Sub‑Store',
    category: 'Hardware',
    productName: 'Lenovo ThinkCentre M70q Tiny Desktop',
    model: 'M70q Gen 4',
    make: 'Lenovo',
    availableQty: 10,
    specs: 'Core i5 13500T, 16GB DDR5, 512GB NVMe SSD, WiFi 6, Keyboard/Mouse',
    status: 'In-Stock',
  },
  {
    id: 'cat-item-9',
    storeId: 'store-2',
    storeName: 'Vikas Bhawan IT Sub‑Store',
    category: 'Hardware',
    productName: 'Canon imageFORMULA Document Scanner',
    model: 'DR-C225 II',
    make: 'Canon',
    availableQty: 4,
    specs: '600 DPI, 25 PPM / 50 IPM Duplex, 30-Sheet ADF, Compact Upright',
    status: 'In-Stock',
  },
  {
    id: 'cat-item-10',
    storeId: 'store-2',
    storeName: 'Vikas Bhawan IT Sub‑Store',
    category: 'Furniture',
    productName: 'Modular Dual-Desk Workstation Set',
    model: 'Modulo-48',
    make: 'Featherlite',
    availableQty: 6,
    specs: 'Pre-laminated Board with Edge Banding, Powder Coated MS Legs, Cable Tray',
    status: 'In-Stock',
  },
  {
    id: 'cat-item-11',
    storeId: 'store-2',
    storeName: 'Vikas Bhawan IT Sub‑Store',
    category: 'Networking',
    productName: 'Aruba Instant On AP22 Wi-Fi 6 Access Point',
    model: 'AP22 (R4W02A)',
    make: 'HPE Aruba',
    availableQty: 8,
    specs: '2x2 Wi-Fi 6 (802.11ax), OFDMA, MU-MIMO, Cloud Managed App',
    status: 'In-Stock',
  },

  // DGHS Central Medical IT Store (store-3)
  {
    id: 'cat-item-12',
    storeId: 'store-3',
    storeName: 'DGHS Central Medical IT Store',
    category: 'Medicine',
    productName: 'Emergency Trauma & First Responder Kit',
    model: 'TraumaPro-100',
    make: 'LifeLine Med',
    availableQty: 30,
    specs: 'Sterile Dressings, Tourniquets, Splints, Resuscitation Mask, Medical Shears',
    status: 'In-Stock',
  },
  {
    id: 'cat-item-13',
    storeId: 'store-3',
    storeName: 'DGHS Central Medical IT Store',
    category: 'Medicine',
    productName: 'Digital 12-Lead Diagnostic ECG Machine',
    model: 'CardioSmart 12',
    make: 'BPL Medical',
    availableQty: 6,
    specs: '7" Color Touchscreen, Simultaneous 12 Leads, Thermal Printer & USB Export',
    status: 'In-Stock',
  },
  {
    id: 'cat-item-14',
    storeId: 'store-3',
    storeName: 'DGHS Central Medical IT Store',
    category: 'Medicine',
    productName: 'Vaccine & Insulin Portable Cold-Chain Carrier',
    model: 'FreezeGuard 12L',
    make: 'Godrej Cold',
    availableQty: 15,
    specs: '2°C to 8°C Digital Temp Logger, 24-Hour Passive Holdover, Rugged Carry Strap',
    status: 'In-Stock',
  },
  {
    id: 'cat-item-15',
    storeId: 'store-3',
    storeName: 'DGHS Central Medical IT Store',
    category: 'Hardware',
    productName: 'Dell Medical Grade Clinical All-in-One PC',
    model: 'OptiPlex 7410 Med',
    make: 'Dell',
    availableQty: 8,
    specs: 'Antimicrobial Casing, Core i7, 16GB RAM, 24" Touchscreen, Barcode Wand',
    status: 'In-Stock',
  },

  // Multi-store availability items (same objects in more than one store)
  {
    id: 'cat-item-16',
    storeId: 'store-2',
    storeName: 'Vikas Bhawan IT Sub‑Store',
    category: 'Hardware',
    productName: 'Dell Latitude 5440 Laptop',
    model: 'Latitude 5440',
    make: 'Dell',
    availableQty: 10,
    specs: 'Intel Core i7 13th Gen, 16GB RAM, 512GB SSD, 14" FHD Antiglare',
    status: 'In-Stock',
  },
  {
    id: 'cat-item-17',
    storeId: 'store-2',
    storeName: 'Vikas Bhawan IT Sub‑Store',
    category: 'Furniture',
    productName: 'Godrej Interio High-Back Ergonomic Executive Chair',
    model: 'Motion Plus',
    make: 'Godrej',
    availableQty: 12,
    specs: 'Breathable Mesh Back, 3D Armrest, Synchro-tilt Lock, Lumbar Support',
    status: 'In-Stock',
  },
  {
    id: 'cat-item-18',
    storeId: 'store-1',
    storeName: 'State Central IT Store',
    category: 'Hardware',
    productName: 'Canon imageFORMULA Document Scanner',
    model: 'DR-C225 II',
    make: 'Canon',
    availableQty: 6,
    specs: '600 DPI, 25 PPM / 50 IPM Duplex, 30-Sheet ADF, Compact Upright',
    status: 'In-Stock',
  },
  {
    id: 'cat-item-19',
    storeId: 'store-1',
    storeName: 'State Central IT Store',
    category: 'Networking',
    productName: 'Aruba Instant On AP22 Wi-Fi 6 Access Point',
    model: 'AP22 (R4W02A)',
    make: 'HPE Aruba',
    availableQty: 12,
    specs: '2x2 Wi-Fi 6 (802.11ax), OFDMA, MU-MIMO, Cloud Managed App',
    status: 'In-Stock',
  },
  {
    id: 'cat-item-20',
    storeId: 'store-1',
    storeName: 'State Central IT Store',
    category: 'Medicine',
    productName: 'Emergency Trauma & First Responder Kit',
    model: 'TraumaPro-100',
    make: 'LifeLine Med',
    availableQty: 15,
    specs: 'Sterile Dressings, Tourniquets, Splints, Resuscitation Mask, Medical Shears',
    status: 'In-Stock',
  },
  {
    id: 'cat-item-21',
    storeId: 'store-2',
    storeName: 'Vikas Bhawan IT Sub‑Store',
    category: 'Stationery',
    productName: 'GFR-2017 Asset Register & Stock Ledger Book',
    model: 'GFR Form-22 Hardbound',
    make: 'Khushbu Press',
    availableQty: 25,
    specs: '300 Folio Pages, Acid-Free Bond Paper, Leatherette Binding',
    status: 'In-Stock',
  },
];

export const INITIAL_WORKFLOW_REQUESTS: WorkflowRequest[] = [
  // 1. Pending Sub-Dept Admin Approval (Desk User -> Sub-Dept Admin)
  {
    id: 'REQ-2026-001',
    requestType: 'Order',
    category: 'Hardware',
    productName: 'Dell Latitude 5440 Laptop',
    productSpecs: 'Intel Core i7 13th Gen, 16GB RAM, 512GB SSD for backend application development',
    quantity: 1,
    reason: 'Official Requirement for developing and testing API services on the state portal.',
    senderId: 'usr-it-infra-desk1',
    senderName: 'Rahul Verma',
    senderRole: 'Employee',
    senderDepartmentId: 'dept-1',
    senderDepartmentName: 'IT Department',
    senderSubDepartment: 'IT – Infra',
    lastHandledToId: 'usr-2',
    lastHandledToName: 'Amit Verma',
    lastHandledToRole: 'SubDepartmentAdmin',
    lastHandledToDept: 'IT Department',
    lastHandledToSubDept: 'IT – Infra',
    status: 'Pending',
    currentApproverRole: 'SubDepartmentAdmin',
    currentApproverId: 'usr-2',
    currentApproverName: 'Amit Verma',
    createdAt: '2026-09-28T09:30:00Z',
    updatedAt: '2026-09-28T09:30:00Z',
    history: [
      {
        id: 'hist-101',
        stepName: 'Requisition Raised',
        actorId: 'usr-it-infra-desk1',
        actorName: 'Rahul Verma',
        actorRole: 'Employee',
        actorDept: 'IT Department',
        actorSubDept: 'IT – Infra',
        action: 'Created',
        timestamp: '2026-09-28T09:30:00Z',
        comments: 'Submitted initial requisition for developer machine.',
      },
    ],
  },

  // 2. Pending Department Admin Approval (Sub-Dept Admin approved and forwarded)
  {
    id: 'REQ-2026-002',
    requestType: 'Replacement',
    category: 'Hardware',
    productName: 'HP LaserJet Pro Enterprise MFP 4104fdw',
    productSpecs: 'Replacement for broken fuser unit and paper roller mechanism',
    quantity: 1,
    reason: 'Fuser assembly unit overheated and roller feeder jammed permanently. Unrepairable on site.',
    existingAssetId: 'DL-IT-PRN-0089',
    existingSerialNo: 'HPCN9824001',
    senderId: 'usr-it-apps-desk1',
    senderName: 'Vikram Joshi',
    senderRole: 'Employee',
    senderDepartmentId: 'dept-1',
    senderDepartmentName: 'IT Department',
    senderSubDepartment: 'IT – Apps',
    lastHandledToId: 'usr-1',
    lastHandledToName: 'Riya Sharma',
    lastHandledToRole: 'Admin',
    lastHandledToDept: 'IT Department',
    lastHandledToSubDept: '',
    status: 'Approved',
    currentApproverRole: 'Admin',
    currentApproverId: 'usr-1',
    currentApproverName: 'Riya Sharma',
    createdAt: '2026-09-27T11:15:00Z',
    updatedAt: '2026-09-28T10:00:00Z',
    history: [
      {
        id: 'hist-201',
        stepName: 'Replacement Ticket Booked',
        actorId: 'usr-it-apps-desk1',
        actorName: 'Vikram Joshi',
        actorRole: 'Employee',
        actorDept: 'IT Department',
        actorSubDept: 'IT – Apps',
        action: 'Created',
        timestamp: '2026-09-27T11:15:00Z',
        comments: 'Defective office printer submitted for replacement voucher.',
      },
      {
        id: 'hist-202',
        stepName: 'Sub-Department Endorsement',
        actorId: 'usr-3',
        actorName: 'Sunita Singh',
        actorRole: 'SubDepartmentAdmin',
        actorDept: 'IT Department',
        actorSubDept: 'IT – Apps',
        action: 'Approved',
        timestamp: '2026-09-28T10:00:00Z',
        comments: 'Verified defective unit. Recommended Department Admin to assign from Central Store.',
      },
    ],
  },

  // 3. In Store Assignment (Dept Admin searched and forwarded to Store Admin)
  {
    id: 'REQ-2026-003',
    requestType: 'Order',
    category: 'Furniture',
    productName: 'Godrej Interio High-Back Ergonomic Executive Chair',
    productSpecs: 'Mesh Back with adjustable lumbar support for workstation 4B',
    quantity: 2,
    reason: 'Ergonomic seating for medical records digitisation section.',
    senderId: 'usr-health-rec-desk1',
    senderName: 'Divya Chopra',
    senderRole: 'Employee',
    senderDepartmentId: 'dept-2',
    senderDepartmentName: 'Health Department',
    senderSubDepartment: 'Health – Records',
    selectedStoreId: 'store-3',
    selectedStoreName: 'DGHS Central Medical IT Store',
    lastHandledToId: 'usr-store-3',
    lastHandledToName: 'Harish Chander',
    lastHandledToRole: 'StoreManager',
    lastHandledToDept: 'Health Department',
    lastHandledToSubDept: 'Health – Records',
    status: 'In Store',
    currentApproverRole: 'StoreManager',
    currentApproverId: 'usr-store-3',
    currentApproverName: 'Harish Chander',
    createdAt: '2026-09-26T14:20:00Z',
    updatedAt: '2026-09-27T16:45:00Z',
    history: [
      {
        id: 'hist-301',
        stepName: 'Order Created',
        actorId: 'usr-health-rec-desk1',
        actorName: 'Divya Chopra',
        actorRole: 'Employee',
        actorDept: 'Health Department',
        actorSubDept: 'Health – Records',
        action: 'Created',
        timestamp: '2026-09-26T14:20:00Z',
        comments: 'Chair request submitted for long duty hours.',
      },
      {
        id: 'hist-302',
        stepName: 'Sub-Department Review',
        actorId: 'usr-7',
        actorName: 'Rakesh Yadav',
        actorRole: 'SubDepartmentAdmin',
        actorDept: 'Health Department',
        actorSubDept: 'Health – Records',
        action: 'Approved',
        timestamp: '2026-09-27T10:10:00Z',
        comments: 'Endorsed and forwarded to Department Admin.',
      },
      {
        id: 'hist-303',
        stepName: 'Store Allocated by Dept Admin',
        actorId: 'usr-5',
        actorName: 'Dr. Sanjay Mishra',
        actorRole: 'Admin',
        actorDept: 'Health Department',
        actorSubDept: '',
        action: 'Forwarded',
        timestamp: '2026-09-27T16:45:00Z',
        comments: 'Searched stores catalog. Forwarded to DGHS Central Medical Store for dispatch.',
      },
    ],
  },

  // 4. Dispatched / Scheduled Delivery (Store assigned asset, set pickup/delivery times)
  {
    id: 'REQ-2026-004',
    requestType: 'Repair',
    category: 'Hardware',
    productName: 'Dell UltraSharp 27" 4K Monitor',
    productSpecs: 'HDMI Port flickering and power supply capacitor check',
    quantity: 1,
    reason: 'Intermittent display blackout during presentations.',
    existingAssetId: 'DL-IT-MON-0142',
    existingSerialNo: 'DELL-US27-8819',
    senderId: 'usr-it-infra-desk2',
    senderName: 'Neha Gupta',
    senderRole: 'Employee',
    senderDepartmentId: 'dept-1',
    senderDepartmentName: 'IT Department',
    senderSubDepartment: 'IT – Infra',
    selectedStoreId: 'store-1',
    selectedStoreName: 'State Central IT Store',
    assignedAssetId: 'DL-IT-MON-0142',
    assignedSerialNo: 'DELL-US27-8819',
    pickupDateTime: '2026-09-30 11:30 AM',
    expectedDeliveryDateTime: '2026-10-02 04:00 PM',
    lastHandledToId: 'usr-it-infra-desk2',
    lastHandledToName: 'Neha Gupta',
    lastHandledToRole: 'Employee',
    lastHandledToDept: 'IT Department',
    lastHandledToSubDept: 'IT – Infra',
    status: 'Dispatched',
    currentApproverRole: 'Requester',
    currentApproverId: 'usr-it-infra-desk2',
    currentApproverName: 'Neha Gupta',
    createdAt: '2026-09-25T08:00:00Z',
    updatedAt: '2026-09-28T14:30:00Z',
    history: [
      {
        id: 'hist-401',
        stepName: 'Repair Request Raised',
        actorId: 'usr-it-infra-desk2',
        actorName: 'Neha Gupta',
        actorRole: 'Employee',
        actorDept: 'IT Department',
        actorSubDept: 'IT – Infra',
        action: 'Created',
        timestamp: '2026-09-25T08:00:00Z',
        comments: 'Display failure logged.',
      },
      {
        id: 'hist-402',
        stepName: 'Approved by Sub-Dept Admin',
        actorId: 'usr-2',
        actorName: 'Amit Verma',
        actorRole: 'SubDepartmentAdmin',
        actorDept: 'IT Department',
        actorSubDept: 'IT – Infra',
        action: 'Approved',
        timestamp: '2026-09-25T11:00:00Z',
      },
      {
        id: 'hist-403',
        stepName: 'Assigned to Central IT Store',
        actorId: 'usr-1',
        actorName: 'Riya Sharma',
        actorRole: 'Admin',
        actorDept: 'IT Department',
        action: 'Forwarded',
        timestamp: '2026-09-26T09:15:00Z',
      },
      {
        id: 'hist-404',
        stepName: 'Repair Scheduled & Item Reserved',
        actorId: 'usr-store-1',
        actorName: 'Rajesh Kumar Sharma',
        actorRole: 'StoreManager',
        actorDept: 'IT Department',
        action: 'Assigned',
        timestamp: '2026-09-28T14:30:00Z',
        comments: 'Hardware technician dispatched for motherboard test. Pickup: Sep 30 11:30 AM, Delivery: Oct 02 04:00 PM.',
      },
    ],
  },

  // 5. Transfer within same sub-department (Completed)
  {
    id: 'REQ-2026-005',
    requestType: 'Transfer',
    category: 'Hardware',
    productName: 'Lenovo ThinkCentre M70q Tiny Desktop',
    productSpecs: 'Core i5 13500T, 16GB RAM, 512GB SSD',
    quantity: 1,
    reason: 'Workload reassignment for database indexing module.',
    existingAssetId: 'DL-IT-PC-0210',
    existingSerialNo: 'LEN-TC-4402',
    senderId: 'usr-it-infra-desk1',
    senderName: 'Rahul Verma',
    senderRole: 'Employee',
    senderDepartmentId: 'dept-1',
    senderDepartmentName: 'IT Department',
    senderSubDepartment: 'IT – Infra',
    transferScope: 'same-subdept',
    targetDepartmentId: 'dept-1',
    targetDepartmentName: 'IT Department',
    targetSubDepartment: 'IT – Infra',
    targetEmployeeId: 'usr-it-infra-desk2',
    targetEmployeeName: 'Neha Gupta',
    lastHandledToId: 'usr-it-infra-desk2',
    lastHandledToName: 'Neha Gupta',
    lastHandledToRole: 'Employee',
    lastHandledToDept: 'IT Department',
    lastHandledToSubDept: 'IT – Infra',
    status: 'Completed',
    createdAt: '2026-09-24T10:00:00Z',
    updatedAt: '2026-09-25T15:20:00Z',
    history: [
      {
        id: 'hist-501',
        stepName: 'Internal Transfer Initiated',
        actorId: 'usr-it-infra-desk1',
        actorName: 'Rahul Verma',
        actorRole: 'Employee',
        actorDept: 'IT Department',
        actorSubDept: 'IT – Infra',
        action: 'Created',
        timestamp: '2026-09-24T10:00:00Z',
        comments: 'Transferring custody to Neha Gupta for active sprint tasks.',
      },
      {
        id: 'hist-502',
        stepName: 'Sub-Department Admin Sanction',
        actorId: 'usr-2',
        actorName: 'Amit Verma',
        actorRole: 'SubDepartmentAdmin',
        actorDept: 'IT Department',
        actorSubDept: 'IT – Infra',
        action: 'Approved',
        timestamp: '2026-09-24T16:00:00Z',
        comments: 'Approved within IT - Infra team. GFR custody record updated.',
      },
      {
        id: 'hist-503',
        stepName: 'Handover Completed',
        actorId: 'usr-it-infra-desk2',
        actorName: 'Neha Gupta',
        actorRole: 'Employee',
        actorDept: 'IT Department',
        actorSubDept: 'IT – Infra',
        action: 'Completed',
        timestamp: '2026-09-25T15:20:00Z',
        comments: 'Physical possession received and inspected.',
      },
    ],
  },

  // 6. Transfer to Another Department (In progress: Sender -> Sender Sub-Dept Admin -> Sender Dept Admin -> Receiver Dept Admin)
  {
    id: 'REQ-2026-006',
    requestType: 'Transfer',
    category: 'Hardware',
    productName: 'Canon imageFORMULA Document Scanner',
    productSpecs: 'Duplex 25 PPM High-Speed Scanner',
    quantity: 1,
    reason: 'Inter-departmental digitization support for Revenue land record archives.',
    existingAssetId: 'DL-IT-SCN-0034',
    existingSerialNo: 'CAN-DR-7711',
    senderId: 'usr-it-apps-desk1',
    senderName: 'Vikram Joshi',
    senderRole: 'Employee',
    senderDepartmentId: 'dept-1',
    senderDepartmentName: 'IT Department',
    senderSubDepartment: 'IT – Apps',
    transferScope: 'across-dept',
    targetDepartmentId: 'dept-3',
    targetDepartmentName: 'Revenue Department',
    targetSubDepartment: 'Revenue – Collections',
    targetEmployeeId: 'usr-rev-col-desk1',
    targetEmployeeName: 'Manish Tiwari',
    lastHandledToId: 'usr-rev-admin',
    lastHandledToName: 'Alok Srivastava',
    lastHandledToRole: 'Admin',
    lastHandledToDept: 'Revenue Department',
    lastHandledToSubDept: '',
    status: 'Approved',
    currentApproverRole: 'Admin',
    currentApproverId: 'usr-rev-admin',
    currentApproverName: 'Alok Srivastava',
    createdAt: '2026-09-27T08:30:00Z',
    updatedAt: '2026-09-28T16:00:00Z',
    history: [
      {
        id: 'hist-601',
        stepName: 'Inter-Department Transfer Initiated',
        actorId: 'usr-it-apps-desk1',
        actorName: 'Vikram Joshi',
        actorRole: 'Employee',
        actorDept: 'IT Department',
        actorSubDept: 'IT – Apps',
        action: 'Created',
        timestamp: '2026-09-27T08:30:00Z',
        comments: 'Scanner transfer proposed to Revenue Collections branch.',
      },
      {
        id: 'hist-602',
        stepName: 'Sender Sub-Dept Admin Approved',
        actorId: 'usr-3',
        actorName: 'Sunita Singh',
        actorRole: 'SubDepartmentAdmin',
        actorDept: 'IT Department',
        actorSubDept: 'IT – Apps',
        action: 'Approved',
        timestamp: '2026-09-27T12:00:00Z',
        comments: 'No immediate software wing dependency. Approved.',
      },
      {
        id: 'hist-603',
        stepName: 'Sender Dept Admin Approved',
        actorId: 'usr-1',
        actorName: 'Riya Sharma',
        actorRole: 'Admin',
        actorDept: 'IT Department',
        action: 'Approved',
        timestamp: '2026-09-28T16:00:00Z',
        comments: 'IT Department clearance granted. Forwarded to Revenue Department Admin for accession.',
      },
    ],
  },

  // 7. Store Assigned (In Store - Ready for Store Manager Action in State Central IT Store)
  {
    id: 'REQ-2026-007',
    requestType: 'Order',
    category: 'Hardware',
    productName: 'Apple MacBook Pro 14" M3 Pro',
    productSpecs: '18GB Unified Memory, 512GB SSD Space Black for Mobile App Development',
    quantity: 1,
    reason: 'Urgent hardware requirement for developing Android/iOS citizen portal apps.',
    senderId: 'usr-it-infra-desk1',
    senderName: 'Rahul Verma',
    senderRole: 'Employee',
    senderDepartmentId: 'dept-1',
    senderDepartmentName: 'IT Department',
    senderSubDepartment: 'IT – Infra',
    selectedStoreId: 'store-1',
    selectedStoreName: 'State Central IT Store',
    lastHandledToId: 'usr-store-1',
    lastHandledToName: 'Rajesh Kumar Sharma',
    lastHandledToRole: 'StoreManager',
    lastHandledToDept: 'IT Department',
    status: 'In Store',
    currentApproverRole: 'StoreManager',
    currentApproverId: 'usr-store-1',
    currentApproverName: 'Rajesh Kumar Sharma',
    createdAt: '2026-09-28T10:00:00Z',
    updatedAt: '2026-09-28T14:00:00Z',
    history: [
      {
        id: 'hist-701',
        stepName: 'Order Created',
        actorId: 'usr-it-infra-desk1',
        actorName: 'Rahul Verma',
        actorRole: 'Employee',
        actorDept: 'IT Department',
        actorSubDept: 'IT – Infra',
        action: 'Created',
        timestamp: '2026-09-28T10:00:00Z',
        comments: 'Submitted requisition for development MacBook.',
      },
      {
        id: 'hist-702',
        stepName: 'Store Allocated by Dept Admin',
        actorId: 'usr-1',
        actorName: 'Riya Sharma',
        actorRole: 'Admin',
        actorDept: 'IT Department',
        action: 'Forwarded',
        timestamp: '2026-09-28T14:00:00Z',
        comments: 'Stock confirmed in Central IT Store. Forwarded to Store Manager for scheduling.',
      },
    ],
  },

  // 8. Pending Desk Officer Sanction (Already forwarded to Store Desk User Mohit Gupta)
  {
    id: 'REQ-2026-008',
    requestType: 'Order',
    category: 'Hardware',
    productName: 'Cisco Catalyst 24-Port Gigabit Managed Switch',
    productSpecs: 'Layer 3 Managed PoE+ Switch for server room rack 2',
    quantity: 2,
    reason: 'Requisitioned for local LAN throughput upgrade in Department HQ.',
    senderId: 'usr-it-infra-desk2',
    senderName: 'Neha Gupta',
    senderRole: 'Employee',
    senderDepartmentId: 'dept-1',
    senderDepartmentName: 'IT Department',
    senderSubDepartment: 'IT – Infra',
    selectedStoreId: 'store-1',
    selectedStoreName: 'State Central IT Store',
    forwardedToDeskOfficerId: 'usr-storeuser-1',
    forwardedToDeskOfficerName: 'Mohit Gupta',
    forwardedToDeskOfficerRemarks: 'Special sanction needed for server room network upgrade; please inspect inventory.',
    forwardedAt: '2026-09-28T15:00:00Z',
    lastHandledToId: 'usr-storeuser-1',
    lastHandledToName: 'Mohit Gupta',
    lastHandledToRole: 'Desk Officer',
    lastHandledToDept: 'IT Department',
    status: 'Pending Desk Officer',
    currentApproverRole: 'Employee',
    currentApproverId: 'usr-storeuser-1',
    currentApproverName: 'Mohit Gupta',
    createdAt: '2026-09-27T09:00:00Z',
    updatedAt: '2026-09-28T15:00:00Z',
    history: [
      {
        id: 'hist-801',
        stepName: 'Requisition Created',
        actorId: 'usr-it-infra-desk2',
        actorName: 'Neha Gupta',
        actorRole: 'Employee',
        actorDept: 'IT Department',
        actorSubDept: 'IT – Infra',
        action: 'Created',
        timestamp: '2026-09-27T09:00:00Z',
      },
      {
        id: 'hist-802',
        stepName: 'Referred to Desk Officer for Sanction',
        actorId: 'usr-store-1',
        actorName: 'Rajesh Kumar Sharma',
        actorRole: 'StoreManager',
        actorDept: 'IT Department',
        action: 'Forwarded',
        timestamp: '2026-09-28T15:00:00Z',
        comments: 'Special sanction needed for server room network upgrade; please inspect inventory.',
      },
    ],
  },

  // 9. Second Pending Desk Officer Sanction (Also with Mohit Gupta to demonstrate existing workload queue)
  {
    id: 'REQ-2026-009',
    requestType: 'Order',
    category: 'Hardware',
    productName: 'Schneider Electric Smart-UPS 3000VA LCD',
    productSpecs: 'Tower/Rack convertible 2700 Watts pure sine wave UPS',
    quantity: 1,
    reason: 'Uninterrupted power backup for central database server.',
    senderId: 'usr-it-infra-desk1',
    senderName: 'Rahul Verma',
    senderRole: 'Employee',
    senderDepartmentId: 'dept-1',
    senderDepartmentName: 'IT Department',
    senderSubDepartment: 'IT – Infra',
    selectedStoreId: 'store-1',
    selectedStoreName: 'State Central IT Store',
    forwardedToDeskOfficerId: 'usr-storeuser-1',
    forwardedToDeskOfficerName: 'Mohit Gupta',
    forwardedToDeskOfficerRemarks: 'High-value backup unit sanction required prior to gate pass issuance.',
    forwardedAt: '2026-09-28T16:30:00Z',
    lastHandledToId: 'usr-storeuser-1',
    lastHandledToName: 'Mohit Gupta',
    lastHandledToRole: 'Desk Officer',
    lastHandledToDept: 'IT Department',
    status: 'Pending Desk Officer',
    currentApproverRole: 'Employee',
    currentApproverId: 'usr-storeuser-1',
    currentApproverName: 'Mohit Gupta',
    createdAt: '2026-09-27T10:30:00Z',
    updatedAt: '2026-09-28T16:30:00Z',
    history: [
      {
        id: 'hist-901',
        stepName: 'Requisition Created',
        actorId: 'usr-it-infra-desk1',
        actorName: 'Rahul Verma',
        actorRole: 'Employee',
        actorDept: 'IT Department',
        actorSubDept: 'IT – Infra',
        action: 'Created',
        timestamp: '2026-09-27T10:30:00Z',
      },
      {
        id: 'hist-902',
        stepName: 'Referred to Desk Officer for Sanction',
        actorId: 'usr-store-1',
        actorName: 'Rajesh Kumar Sharma',
        actorRole: 'StoreManager',
        actorDept: 'IT Department',
        action: 'Forwarded',
        timestamp: '2026-09-28T16:30:00Z',
        comments: 'High-value backup unit sanction required prior to gate pass issuance.',
      },
    ],
  },

  // 10. Store Desk User Requisition (Mohit Gupta asks from Store Manager Rajesh Kumar Sharma)
  {
    id: 'REQ-2026-010',
    requestType: 'Order',
    category: 'Hardware',
    productName: 'Honeywell Voyager 1400g 2D Barcode Scanner',
    productSpecs: 'Omnidirectional USB barcode & QR code scanner for parcel staging desk',
    quantity: 2,
    reason: 'Required at Store Desk for instant dispatch scanning, QR code generation, and manifest logging.',
    senderId: 'usr-storeuser-1',
    senderName: 'Mohit Gupta',
    senderRole: 'StoreUser',
    senderDepartmentId: 'dept-1',
    senderDepartmentName: 'State Central IT Store',
    selectedStoreId: 'store-1',
    selectedStoreName: 'State Central IT Store',
    targetEmployeeId: 'usr-storeuser-1',
    targetEmployeeName: 'Mohit Gupta',
    lastHandledToId: 'usr-store-1',
    lastHandledToName: 'Rajesh Kumar Sharma',
    lastHandledToRole: 'StoreManager',
    lastHandledToDept: 'State Central IT Store',
    status: 'Pending',
    currentApproverRole: 'StoreManager',
    currentApproverId: 'usr-store-1',
    currentApproverName: 'Rajesh Kumar Sharma',
    createdAt: '2026-09-29T10:00:00Z',
    updatedAt: '2026-09-29T10:00:00Z',
    history: [
      {
        id: 'hist-1001',
        stepName: 'Order Requisition Submitted to Store Manager',
        actorId: 'usr-storeuser-1',
        actorName: 'Mohit Gupta',
        actorRole: 'StoreUser',
        actorDept: 'State Central IT Store',
        action: 'Created',
        timestamp: '2026-09-29T10:00:00Z',
        comments: 'Store Desk User Mohit Gupta requested scanner units. Submitted directly to Store Manager Rajesh Kumar Sharma for approval across stores.',
      },
    ],
  },

  // 11. Inter-Store Requisition (Store Manager Rajesh Kumar Sharma needs asset from another store: DGHS Medical Store)
  {
    id: 'REQ-2026-011',
    requestType: 'Order',
    category: 'Medicine',
    productName: 'First Aid Trauma Emergency Response Kit (Grade-A)',
    productSpecs: 'Wall-mountable certified industrial first aid & emergency stabilization kit',
    quantity: 3,
    reason: 'Mandatory workplace health & safety compliance kits for IT server room and logistics bay.',
    senderId: 'usr-store-1',
    senderName: 'Rajesh Kumar Sharma',
    senderRole: 'StoreManager',
    senderDepartmentId: 'dept-1',
    senderDepartmentName: 'State Central IT Store',
    targetEmployeeId: 'usr-store-1',
    targetEmployeeName: 'Rajesh Kumar Sharma',
    isInterStoreRequisition: true,
    selectedStoreId: 'store-3',
    selectedStoreName: 'DGHS Medical Central Depot',
    lastHandledToId: 'usr-store-3',
    lastHandledToName: 'Dr. Rajiv Nanda',
    lastHandledToRole: 'StoreManager',
    lastHandledToDept: 'DGHS Medical Central Depot',
    status: 'Pending',
    currentApproverRole: 'StoreManager',
    currentApproverId: 'usr-store-3',
    currentApproverName: 'Dr. Rajiv Nanda',
    createdAt: '2026-09-29T11:30:00Z',
    updatedAt: '2026-09-29T11:30:00Z',
    history: [
      {
        id: 'hist-1101',
        stepName: 'Inter-Store Requisition Raised to DGHS Medical Central Depot',
        actorId: 'usr-store-1',
        actorName: 'Rajesh Kumar Sharma',
        actorRole: 'StoreManager',
        actorDept: 'State Central IT Store',
        action: 'Created',
        timestamp: '2026-09-29T11:30:00Z',
        comments: 'Store Manager Rajesh Kumar Sharma requested emergency medical kits from DGHS Medical Depot. Pending approval by Store Manager Dr. Rajiv Nanda.',
      },
    ],
  },

  // 12. Self-Store Requisition (Store Manager Rajesh Kumar Sharma requests from his own store: both sender and receiver)
  {
    id: 'REQ-2026-012',
    requestType: 'Order',
    category: 'Hardware',
    productName: 'Logitech MX Master 3S Wireless Mouse',
    productSpecs: 'Quiet click, 8K DPI sensor, Bluetooth & Bolt receiver',
    quantity: 1,
    reason: 'Internal allocation for Store Manager administrative workstation.',
    senderId: 'usr-store-1',
    senderName: 'Rajesh Kumar Sharma',
    senderRole: 'StoreManager',
    senderDepartmentId: 'dept-1',
    senderDepartmentName: 'State Central IT Store',
    targetEmployeeId: 'usr-store-1',
    targetEmployeeName: 'Rajesh Kumar Sharma',
    isSelfStoreRequisition: true,
    selectedStoreId: 'store-1',
    selectedStoreName: 'State Central IT Store',
    lastHandledToId: 'usr-store-1',
    lastHandledToName: 'Rajesh Kumar Sharma (Sender & Receiver)',
    lastHandledToRole: 'StoreManager',
    lastHandledToDept: 'State Central IT Store',
    status: 'In Store',
    currentApproverRole: 'StoreManager',
    currentApproverId: 'usr-store-1',
    currentApproverName: 'Rajesh Kumar Sharma',
    createdAt: '2026-09-29T14:00:00Z',
    updatedAt: '2026-09-29T14:00:00Z',
    history: [
      {
        id: 'hist-1201',
        stepName: 'Self-Store Requisition (Sender & Receiver: Rajesh Kumar Sharma)',
        actorId: 'usr-store-1',
        actorName: 'Rajesh Kumar Sharma',
        actorRole: 'StoreManager',
        actorDept: 'State Central IT Store',
        action: 'Created',
        timestamp: '2026-09-29T14:00:00Z',
        comments: 'Store Manager Rajesh Kumar Sharma created internal self-requisition from own store (State Central IT Store). Store Manager acts as both sender and receiver person.',
      },
    ],
  },
];

export const INITIAL_WORKFLOW_NOTIFICATIONS: WorkflowNotification[] = [
  {
    id: 'notif-1',
    requestId: 'REQ-2026-001',
    recipientId: 'usr-2',
    title: 'New Requisition Pending Approval',
    message: 'Rahul Verma has submitted a new Order for "Dell Latitude 5440 Laptop" requiring your endorsement.',
    type: 'action_required',
    createdAt: '2026-09-28T09:30:00Z',
    isRead: false,
  },
  {
    id: 'notif-2',
    requestId: 'REQ-2026-002',
    recipientId: 'usr-1',
    title: 'Replacement Request Forwarded',
    message: 'Sunita Singh forwarded a Replacement request for "HP LaserJet Pro Enterprise MFP" for store allocation.',
    type: 'action_required',
    createdAt: '2026-09-28T10:00:00Z',
    isRead: false,
  },
  {
    id: 'notif-3',
    requestId: 'REQ-2026-003',
    recipientId: 'usr-store-3',
    title: 'New Store Indent Assigned',
    message: 'Dr. Sanjay Mishra routed Order REQ-2026-003 to DGHS Central Medical Store for reservation & dispatch.',
    type: 'action_required',
    createdAt: '2026-09-27T16:45:00Z',
    isRead: false,
  },
  {
    id: 'notif-4',
    requestId: 'REQ-2026-004',
    recipientId: 'usr-it-infra-desk2',
    title: 'Repair Scheduled & Dispatched',
    message: 'State Central IT Store scheduled repair pickup on Sep 30, 11:30 AM. Expected Delivery: Oct 02, 04:00 PM.',
    type: 'info',
    createdAt: '2026-09-28T14:30:00Z',
    isRead: false,
  },
];

/**
 * Filter requests strictly based on user's role and organizational scope.
 * Rule:
 * - SuperAdmin: Sees all requests globally
 * - Dept Admin: Sees requests for their entire department + store interactions
 * - Sub-Dept Admin: Sees their sub-dept + related store interactions
 * - Store Admin: Sees only their store's incoming requests
 * - Desk User: Sees only their own requests & immediate approvals
 */
export function getScopedWorkflowRequests(
  user: User,
  requests: WorkflowRequest[]
): WorkflowRequest[] {
  if (user.role === 'SuperAdmin') {
    return requests;
  }

  if (user.role === 'StoreManager' || user.role === 'StoreUser') {
    return requests.filter(
      (r) =>
        r.senderId === user.id ||
        r.targetEmployeeId === user.id ||
        r.selectedStoreId === user.storeId ||
        r.lastHandledToId === user.id ||
        r.forwardedToDeskOfficerId === user.id ||
        r.currentApproverId === user.id ||
        (user.storeId && r.selectedStoreId === user.storeId) ||
        (user.role === 'StoreManager' && (r.currentApproverRole === 'StoreManager' || r.status === 'In Store' || r.selectedStoreId === user.storeId || r.targetStoreId === user.storeId))
    );
  }

  if (user.role === 'Admin') {
    // Dept Admin: Sees entire department
    return requests.filter(
      (r) =>
        r.senderDepartmentId === user.departmentId ||
        r.targetDepartmentId === user.departmentId ||
        r.currentApproverId === user.id ||
        r.lastHandledToId === user.id
    );
  }

  if (user.role === 'SubDepartmentAdmin') {
    // Sub-Dept Admin: Sees their sub-department
    return requests.filter(
      (r) =>
        (r.senderDepartmentId === user.departmentId &&
          r.senderSubDepartment === user.subDepartment) ||
        (r.targetDepartmentId === user.departmentId &&
          r.targetSubDepartment === user.subDepartment) ||
        r.currentApproverId === user.id ||
        r.lastHandledToId === user.id
    );
  }

  // Desk User / Employee / Desk Officer
  const isDeskOfficer = user.designation?.toLowerCase().includes('desk officer');
  return requests.filter(
    (r) =>
      r.senderId === user.id ||
      r.targetEmployeeId === user.id ||
      r.currentApproverId === user.id ||
      r.forwardedToDeskOfficerId === user.id ||
      (isDeskOfficer && r.status === 'Pending Desk Officer' && (!r.senderDepartmentId || r.senderDepartmentId === user.departmentId))
  );
}

/**
 * Helper to fetch designated Desk Officers / Employees under a specific Store for requisition referral & sanction.
 * Store Managers can ONLY view and delegate to employees/desk users assigned to that store.
 */
export function getStoreDeskOfficers(
  users: User[],
  storeId?: string,
  departmentId?: string,
  excludeUserId?: string
): User[] {
  if (storeId) {
    const normalizedStoreId = storeId.trim().toLowerCase();
    const storeEmployees = users.filter((u) => {
      if (excludeUserId && u.id === excludeUserId) return false;
      // Do not assign to another Store Manager
      if (u.role === 'StoreManager') return false;
      // Exclude deactivated or inactive staff
      if (u.isActive === false || u.employmentStatus === 'Deactivated') return false;
      // Must belong strictly to this store
      return Boolean(u.storeId && u.storeId.trim().toLowerCase() === normalizedStoreId);
    });

    if (storeEmployees.length > 0) {
      return storeEmployees;
    }
  }

  // Fallback: If no store-specific employees found, find department employees
  const deptOfficers = departmentId
    ? users.filter(
        (u) =>
          u.id !== excludeUserId &&
          u.role !== 'StoreManager' &&
          u.departmentId === departmentId &&
          u.isActive !== false &&
          u.employmentStatus !== 'Deactivated' &&
          (u.designation?.toLowerCase().includes('desk officer') ||
            u.designation?.toLowerCase().includes('desk user') ||
            u.role === 'StoreUser' ||
            u.role === 'Employee')
      )
    : [];

  if (deptOfficers.length > 0) return deptOfficers;

  // Final fallback across all active users
  const allOfficers = users.filter(
    (u) =>
      u.id !== excludeUserId &&
      u.role !== 'StoreManager' &&
      u.isActive !== false &&
      u.employmentStatus !== 'Deactivated' &&
      (u.designation?.toLowerCase().includes('desk') ||
        u.role === 'StoreUser' ||
        u.role === 'Employee')
  );

  return allOfficers.length > 0 ? allOfficers : users.filter((u) => u.id !== excludeUserId && u.role === 'Employee');
}

/**
 * Backward-compatible helper to fetch designated Desk Officers
 */
export function getDeskOfficers(
  users: User[],
  departmentId?: string,
  storeId?: string,
  excludeUserId?: string
): User[] {
  return getStoreDeskOfficers(users, storeId, departmentId, excludeUserId);
}

/**
 * Scoped employee dropdown filter:
 * Must never show employees from other departments or unrelated sub-departments!
 */
export function getScopedEmployeesForTransfer(
  currentUser: User,
  allUsers: User[],
  options: {
    transferScope?: 'same-subdept' | 'across-subdept' | 'across-dept' | 'to-superadmin';
    targetDeptId?: string;
    targetSubDept?: string;
  }
): User[] {
  const { transferScope, targetDeptId, targetSubDept } = options;

  // RULE: The Super Admin will transfer his assets to ONLY Department Admin and not any employee!
  if (currentUser.role === 'SuperAdmin') {
    return allUsers.filter((u) => {
      if (u.role !== 'Admin') return false; // STRICT: ONLY Department Admins!
      if (targetDeptId && u.departmentId !== targetDeptId) return false;
      return true;
    });
  }

  if (transferScope === 'to-superadmin') {
    return allUsers.filter((u) => u.role === 'SuperAdmin');
  }

  const resolvedDeptId = targetDeptId || currentUser.departmentId;

  // RULE: When a department admin is choosing recipients (or in inter-department transfers):
  // - If not choosing any sub-department: see all employees who are NOT in any sub-department.
  // - As he chooses a sub-department: employees under that specific sub-department should ONLY be visible.
  if (
    currentUser.role === 'Admin' ||
    transferScope === 'across-dept' ||
    (targetDeptId && targetDeptId !== currentUser.departmentId)
  ) {
    if (!resolvedDeptId) return [];
    return allUsers.filter((u) => {
      if (u.id === currentUser.id) return false;
      if (u.departmentId !== resolvedDeptId) return false;
      if (u.role === 'SuperAdmin' || u.role === 'StoreManager' || u.role === 'StoreUser') return false;

      if (!targetSubDept || targetSubDept.trim() === '') {
        // When not choosing any sub-department: see all employees who are NOT in any sub-department!
        return !u.subDepartment || u.subDepartment.trim() === '';
      } else {
        // When choosing a sub-department: employees under that specific sub-department ONLY!
        return u.subDepartment === targetSubDept;
      }
    });
  }

  if (transferScope === 'same-subdept') {
    // ONLY employees within the same sub-department (or direct department employees if user has no sub-department)
    return allUsers.filter(
      (u) =>
        u.id !== currentUser.id &&
        u.departmentId === currentUser.departmentId &&
        (currentUser.subDepartment
          ? u.subDepartment === currentUser.subDepartment
          : !u.subDepartment || u.subDepartment.trim() === '') &&
        u.role !== 'SuperAdmin' &&
        u.role !== 'StoreManager' &&
        u.role !== 'StoreUser'
    );
  }

  if (transferScope === 'across-subdept') {
    // ONLY employees within specified target sub-department in the same department
    return allUsers.filter(
      (u) =>
        u.id !== currentUser.id &&
        u.departmentId === currentUser.departmentId &&
        (targetSubDept
          ? u.subDepartment === targetSubDept
          : !u.subDepartment || u.subDepartment.trim() === '') &&
        u.role !== 'SuperAdmin' &&
        u.role !== 'StoreManager' &&
        u.role !== 'StoreUser'
    );
  }

  return [];
}

export const HIERARCHY_USERS: User[] = [
  {
    id: 'usr-store-manager',
    employeeCode: 'STR-MGR-01',
    name: 'Khushbu',
    username: 'storemanager',
    gender: 'Male',
    dob: '1988-01-01',
    isFirstLogin: false,
    email: 'store.manager@khushbu.com',
    mobile: '9876543210',
    designation: 'Store Manager',
    departmentId: 'dept-1',
    subDepartment: 'Central Store Logistics',
    divisionDistrict: 'Khushbu Central',
    subLocation: 'Khushbu Central Hub',
    role: 'StoreManager',
    isActive: true,
    employmentStatus: 'Active',
    joinedAt: '2023-01-15T09:00:00Z',
    password: 'password123',
    storeId: 'store-1',
  },
];
