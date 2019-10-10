const fs = require('fs')
const parse = require('csv').parse
const stringify = require('csv').stringify
const transform = require('stream-transform')
const register = require('./local-authority-eng.json')

function findLocalAuthorityByName (name) {
  return Object.keys(register).find(key => register[key].item.find(item => item['official-name'] === name || item['name'] === name))
}

function mapper (row) {
  const v2 = {
    organisation: findLocalAuthorityByName(row.OrganisationLabel),
    'brownfield-site': row.SiteReference,
    'entry-date': row.LastUpdatedDate,
    'start-date': row.FirstAddedDate,
    'end-date': null,
    'planning-application': null,
    'planning-url': row.PlanningHistory,
    'planning-permission-date': row.PermissionDate,
    'planning-permission-status': row.PlanningStatus,
    hecatres: row.Hectares,
    'land-ownership-status': row.OwnershipStatus,
    'siteplan-url': row.SiteplanURL,
    notes: `${row.Notes}\n${row.DevelopmentDescription}\n${row.SiteInformation}\n${row.NonHousingDevelopment}`,
    address: row.SiteNameAddress,
    coordinates: null,
    deliverable: row.Deliverable,
    'min-net-dwellings': row.MinNetDwellings || row.NetDwellingsRangeFrom,
    'max-net-dwellings': row.NetDwellingsRangeTo
  }

  return v2
}

fs.createReadStream('./example.csv').pipe(parse({ delimiter: ',', columns: true }))
  .pipe(transform(mapper))
  .pipe(stringify({ header: true }))
  .pipe(fs.createWriteStream('./mapped.csv'))
