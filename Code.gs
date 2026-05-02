// ChildLink – Google Apps Script Backend

const SHEET_NAME_MISSING = 'مفقودين';
const SHEET_NAME_FOUND   = 'معثور عليهم';

function getOrCreateSS() {
  const files = DriveApp.getFilesByName('ChildLink - بيانات البلاغات');
  if (files.hasNext()) return SpreadsheetApp.open(files.next());
  const ss = SpreadsheetApp.create('ChildLink - بيانات البلاغات');
  const s1 = ss.getActiveSheet();
  s1.setName(SHEET_NAME_MISSING);
  s1.appendRow(['ID','اسم الطفل','العمر','الجنس','لون البشرة','وصف الطفل','آخر مكان شوهد فيه','المنطقة','تاريخ الاختفاء','صورة','ولي الأمر','الهاتف','البريد','الحالة','تاريخ الإضافة']);
  s1.getRange(1,1,1,15).setBackground('#0D3B1E').setFontColor('#fff').setFontWeight('bold');
  const s2 = ss.insertSheet(SHEET_NAME_FOUND);
  s2.appendRow(['ID','اسم الطفل','العمر','الجنس','الحالة الصحية','وصف الطفل','مكان العثور','المنطقة','تاريخ العثور','صورة','المُبلِّغ','الهاتف','الطفل مع','الحالة','تاريخ الإضافة']);
  s2.getRange(1,1,1,15).setBackground('#1B5E20').setFontColor('#fff').setFontWeight('bold');
  return ss;
}

function getSheet(name) {
  const ss = getOrCreateSS();
  let sheet = ss.getSheetByName(name);
  // لو الورقة مش موجودة، اعملها
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === SHEET_NAME_MISSING) {
      sheet.appendRow(['ID','اسم الطفل','العمر','الجنس','لون البشرة','وصف الطفل','آخر مكان شوهد فيه','المنطقة','تاريخ الاختفاء','صورة','ولي الأمر','الهاتف','البريد','الحالة','تاريخ الإضافة']);
      sheet.getRange(1,1,1,15).setBackground('#0D3B1E').setFontColor('#fff').setFontWeight('bold');
    } else {
      sheet.appendRow(['ID','اسم الطفل','العمر','الجنس','الحالة الصحية','وصف الطفل','مكان العثور','المنطقة','تاريخ العثور','صورة','المُبلِّغ','الهاتف','الطفل مع','الحالة','تاريخ الإضافة']);
      sheet.getRange(1,1,1,15).setBackground('#1B5E20').setFontColor('#fff').setFontWeight('bold');
    }
  }
  return sheet;
}

function doGet(e) {
  const action = e.parameter.action || '';
  const p = e.parameter;
  const now = new Date().toLocaleString('ar-EG');
  const id  = Date.now();

  try {
    if (action === 'missing') {
      const rows = getSheet(SHEET_NAME_MISSING).getDataRange().getValues();
      const data = rows.slice(1).filter(r => r[0]).map(r => ({
        id: r[0], name: r[1], age: r[2], gender: r[3], skin: r[4],
        description: r[5], last_seen: r[6], area: r[7], lost_at: r[8],
        image_path: r[9], guardian: r[10], phone: r[11], email: r[12],
        status: r[13], created_at: r[14]
      }));
      return respond({success: true, data: data});
    }

    if (action === 'found') {
      const rows = getSheet(SHEET_NAME_FOUND).getDataRange().getValues();
      const data = rows.slice(1).filter(r => r[0]).map(r => ({
        id: r[0], name: r[1], age: r[2], gender: r[3], health: r[4],
        description: r[5], found_location: r[6], area: r[7], found_at: r[8],
        image_path: r[9], reporter: r[10], phone: r[11], child_with: r[12],
        status: r[13], created_at: r[14]
      }));
      return respond({success: true, data: data});
    }

    if (action === 'save') {
      if (p.type === 'missing') {
        getSheet(SHEET_NAME_MISSING).appendRow([
          id, p.name||'', p.age||'', p.gender||'', p.skin||'',
          p.description||'', p.last_seen||'', p.area||'',
          p.lost_at||'', '', p.guardian||'', p.phone||'', p.email||'',
          'مفقود', now
        ]);
        return respond({success: true, id: id});
      }
      if (p.type === 'found') {
        getSheet(SHEET_NAME_FOUND).appendRow([
          id, p.name||'مجهول', p.age||'', p.gender||'', p.health||'',
          p.description||'', p.found_location||'', p.area||'',
          p.found_at||'', '', p.reporter||'', p.phone||'', p.child_with||'',
          'تم العثور عليه', now
        ]);
        return respond({success: true, id: id});
      }
    }

    return respond({success: false, error: 'action غير معروف'});
  } catch(err) {
    return respond({success: false, error: err.message});
  }
}

function doPost(e) { return doGet(e); }

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
