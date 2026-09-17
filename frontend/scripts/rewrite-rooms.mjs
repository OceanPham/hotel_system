/**
 * Rewrite mock room catalog: 10 seed + 18 realistic extras = 28 rooms.
 * All image URLs pre-verified HTTP 200 (Unsplash).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function write(rel, data) {
  const p = path.join(root, rel);
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log('W', rel, Array.isArray(data) ? data.length : '');
}

// Verified 200 — hotel/bedroom interiors (unique)
const IMAGES = [
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1617859047452-8510bcf207fd?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1587985064135-0366536eab42?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1568495248636-6432b97bd949?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
];

const seedRooms = [
  { id: 1, roomName: 'Garden Deluxe', roomNumber: '101', roomType: 'Standard', basePrice: 500000, status: 'Vacant', description: 'Phòng tiêu chuẩn nhìn ra vườn, không gian xanh mát.' },
  { id: 2, roomName: 'Cozy Standard', roomNumber: '102', roomType: 'Standard', basePrice: 500000, status: 'Vacant', description: 'Phòng tiêu chuẩn thiết kế ấm cúng, đầy đủ tiện nghi.' },
  { id: 3, roomName: 'City View Deluxe', roomNumber: '103', roomType: 'Deluxe', basePrice: 800000, status: 'Vacant', description: 'Phòng deluxe với cửa sổ lớn nhìn ra thành phố.' },
  { id: 4, roomName: 'Balcony Retreat', roomNumber: '104', roomType: 'Deluxe', basePrice: 800000, status: 'Vacant', description: 'Phòng deluxe có ban công riêng, thoáng đãng.' },
  { id: 5, roomName: 'Ocean Suite', roomNumber: '105', roomType: 'Suite', basePrice: 1500000, status: 'Vacant', description: 'Phòng suite cao cấp với view biển tuyệt đẹp.' },
  { id: 6, roomName: 'Premier Sea Suite', roomNumber: '106', roomType: 'Suite', basePrice: 1500000, status: 'Vacant', description: 'Suite sang trọng, hướng biển toàn cảnh.' },
  { id: 7, roomName: 'Budget Smart', roomNumber: '107', roomType: 'Standard', basePrice: 500000, status: 'Vacant', description: 'Phòng tiết kiệm với không gian tiện nghi cơ bản.' },
  { id: 8, roomName: 'Tranquil Corner', roomNumber: '108', roomType: 'Standard', basePrice: 500000, status: 'Vacant', description: 'Phòng ở vị trí yên tĩnh, phù hợp nghỉ ngơi.' },
  { id: 9, roomName: 'Skyline Deluxe', roomNumber: '109', roomType: 'Deluxe', basePrice: 800000, status: 'Vacant', description: 'Phòng deluxe tầng cao, view toàn cảnh thành phố.' },
  { id: 10, roomName: 'Luxury Bath Suite', roomNumber: '110', roomType: 'Suite', basePrice: 1500000, status: 'Vacant', description: 'Suite cao cấp có bồn tắm hiện đại, sang trọng.' },
];

const extraDefs = [
  { roomName: 'Palm Courtyard', roomNumber: '201', roomType: 'Standard', basePrice: 520000, description: 'Phòng hướng sân trong nhiệt đới, ánh sáng tự nhiên dễ chịu.' },
  { roomName: 'Harbor Breeze Deluxe', roomNumber: '202', roomType: 'Deluxe', basePrice: 850000, description: 'Deluxe thoáng đãng với gió biển và nội thất gỗ ấm.' },
  { roomName: 'Coral Reef Suite', roomNumber: '203', roomType: 'Suite', basePrice: 1600000, description: 'Suite rộng với tông san hô và góc nghỉ riêng tư.' },
  { roomName: 'Bamboo Garden', roomNumber: '204', roomType: 'Standard', basePrice: 530000, description: 'Không gian xanh nhìn ra hàng tre, yên tĩnh.' },
  { roomName: 'Pearl Harbor Deluxe', roomNumber: '205', roomType: 'Deluxe', basePrice: 880000, description: 'Deluxe ánh ngọc trai, cửa kính lớn đón nắng chiều.' },
  { roomName: 'Emerald Lagoon Suite', roomNumber: '206', roomType: 'Suite', basePrice: 1650000, description: 'Suite cao cấp hướng đầm phá xanh ngọc.' },
  { roomName: 'Sunrise Loft', roomNumber: '207', roomType: 'Standard', basePrice: 540000, description: 'Phòng gác xép đón bình minh, phù hợp cặp đôi.' },
  { roomName: 'Misty Highlands Deluxe', roomNumber: '208', roomType: 'Deluxe', basePrice: 870000, description: 'Deluxe tông đất ấm, cảm giác nghỉ dưỡng núi.' },
  { roomName: 'Royal Orchid Suite', roomNumber: '209', roomType: 'Suite', basePrice: 1700000, description: 'Suite hoa lan hoàng gia, phòng khách riêng.' },
  { roomName: 'Sand Dune Retreat', roomNumber: '210', roomType: 'Standard', basePrice: 510000, description: 'Phòng tông cát ấm, gần lối ra bãi biển.' },
  { roomName: 'Azure Horizon Deluxe', roomNumber: '211', roomType: 'Deluxe', basePrice: 900000, description: 'Deluxe xanh azure với tầm nhìn đường chân trời.' },
  { roomName: 'Moonlight Pavilion', roomNumber: '212', roomType: 'Suite', basePrice: 1750000, description: 'Suite ánh trăng, ban công rộng ngắm vịnh về đêm.' },
  { roomName: 'Fern Valley', roomNumber: '213', roomType: 'Standard', basePrice: 525000, description: 'Phòng nhìn thung lũng dương xỉ, không khí trong lành.' },
  { roomName: 'Cliffside Deluxe', roomNumber: '214', roomType: 'Deluxe', basePrice: 920000, description: 'Deluxe sát vách đá, view biển ấn tượng.' },
  { roomName: 'Golden Lotus Suite', roomNumber: '215', roomType: 'Suite', basePrice: 1800000, description: 'Suite sen vàng, phòng tắm đá marble cao cấp.' },
  { roomName: 'Riverside Quiet', roomNumber: '216', roomType: 'Standard', basePrice: 515000, description: 'Phòng ven sông yên tĩnh, lý tưởng làm việc và nghỉ.' },
  { roomName: 'Twilight Bay Deluxe', roomNumber: '217', roomType: 'Deluxe', basePrice: 890000, description: 'Deluxe vịnh hoàng hôn, ánh đèn ấm mỗi chiều.' },
  { roomName: 'Infinity Crown Suite', roomNumber: '218', roomType: 'Suite', basePrice: 1850000, description: 'Suite đỉnh cao với không gian mở và bồn tắm đứng.' },
];

if (IMAGES.length < seedRooms.length + extraDefs.length) {
  throw new Error('Not enough unique verified images');
}

const seedImages = seedRooms.map((r, i) => ({
  id: i + 1,
  roomId: r.id,
  imageUrl: IMAGES[i],
  isMain: true,
}));

const extraRooms = extraDefs.map((d, i) => ({
  id: 101 + i,
  ...d,
  status: 'Vacant',
}));

const extraImages = extraRooms.map((r, i) => ({
  id: 1000 + i,
  roomId: r.id,
  imageUrl: IMAGES[seedRooms.length + i],
  isMain: true,
}));

write('src/mock/data/rooms.json', seedRooms);
write('src/mock/data/roomImages.json', seedImages);
write('src/mock/fixtures/rooms-extra.json', extraRooms);
write('src/mock/fixtures/roomImages-extra.json', extraImages);

console.log('Total rooms:', seedRooms.length + extraRooms.length);
console.log('Unique images:', new Set([...seedImages, ...extraImages].map((x) => x.imageUrl)).size);
