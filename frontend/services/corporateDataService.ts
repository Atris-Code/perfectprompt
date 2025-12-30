import type { CorporateEntity, Asset } from '../types';

// The data is an array of top-level parent entities
const db: CorporateEntity[] = [
  {
    "EntityID": "E1001",
    "EntityName": "Global Energy Holdings Inc.",
    "EntityType": "Corporation",
    "HeadquartersCountry": "USA",
    "WikiURL": "http://en.wikipedia.org/wiki/...",
    "Subsidiaries": [
      {
        "EntityID": "E2005",
        "EntityName": "Sudamérica Cementos S.A.",
        "EntityType": "Corporation",
        "HeadquartersCountry": "Colombia",
        "WikiURL": "http://en.wikipedia.org/wiki/...",
        // FIX: OwnershipPercentage belongs to the entity, not the relationship, moved to the correct level in types.ts.
        "OwnershipPercentage": 85.0,
        "Subsidiaries": [],
        "Assets": [
          {
            "PlantID": "P3012",
            "PlantName": "Planta de Cemento de Bogotá",
            "Country": "Colombia",
            "Status": "Operating",
            "Capacity": 1.5,
            "CapacityUnit": "million tonnes",
            "OwnershipPercentage": 100.0,
            "AssetType": "Cement and Concrete"
          }
        ]
      }
    ],
    "Assets": []
  },
  {
    "EntityID": "E4500",
    "EntityName": "Vattenfall AB",
    "EntityType": "State-Owned Enterprise",
    "HeadquartersCountry": "Sweden",
    "WikiURL": "https://en.wikipedia.org/wiki/Vattenfall",
    "Subsidiaries": [],
    "Assets": [
      {
        "AssetID": "B101",
        "AssetName": "Uppsala CHP Plant",
        "Country": "Sweden",
        "Status": "Operating",
        "Capacity": 220,
        "CapacityUnit": "MW",
        "OwnershipPercentage": 100.0,
        "AssetType": "Bioenergy Power"
      },
      {
        "AssetID": "B102",
        "AssetName": "Jordbro CHP Plant",
        "Country": "Sweden",
        "Status": "Operating",
        "Capacity": 180,
        "CapacityUnit": "MW",
        "OwnershipPercentage": 100.0,
        "AssetType": "Bioenergy Power"
      },
      {
        "AssetID": "B201",
        "AssetName": "Diemen Bioenergy Plant",
        "Country": "Netherlands",
        "Status": "Operating",
        "Capacity": 120,
        "CapacityUnit": "MW",
        "OwnershipPercentage": 100.0,
        "AssetType": "Bioenergy Power"
      }
    ]
  },
  {
    "EntityID": "E5000",
    "EntityName": "Fortum",
    "EntityType": "Corporation",
    "HeadquartersCountry": "Finland",
    "WikiURL": "https://en.wikipedia.org/wiki/Fortum",
    "Subsidiaries": [],
    "Assets": [
       {
        "AssetID": "B301",
        "AssetName": "Joensuu Bioenergy Plant",
        "Country": "Finland",
        "Status": "Operating",
        "Capacity": 50,
        "CapacityUnit": "MW",
        "OwnershipPercentage": 100.0,
        "AssetType": "Bioenergy Power"
      }
    ]
  },
  {
    "EntityID": "E6000",
    "EntityName": "Statkraft",
    "EntityType": "State-Owned Enterprise",
    "HeadquartersCountry": "Norway",
    "WikiURL": "https://en.wikipedia.org/wiki/Statkraft",
    "Subsidiaries": [],
    "Assets": [
      {
        "AssetID": "B401",
        "AssetName": "Trondheim District Heating",
        "Country": "Norway",
        "Status": "Operating",
        "Capacity": 120,
        "CapacityUnit": "MW",
        "OwnershipPercentage": 100.0,
        "AssetType": "Bioenergy Power"
      }
    ]
  },
  {
    "EntityID": "E7000",
    "EntityName": "Ørsted A/S",
    "EntityType": "Corporation",
    "HeadquartersCountry": "Denmark",
    "WikiURL": "https://en.wikipedia.org/wiki/%C3%98rsted_(company)",
    "Subsidiaries": [],
    "Assets": [
      {
        "AssetID": "W101",
        "AssetName": "Hornsea 1 Offshore Wind Farm",
        "Country": "United Kingdom",
        "Status": "Operating",
        "Capacity": 1218,
        "CapacityUnit": "MW",
        "OwnershipPercentage": 50.0,
        "AssetType": "Offshore Wind Power"
      },
      {
        "AssetID": "W102",
        "AssetName": "Borssele 1 & 2 Offshore Wind Farm",
        "Country": "Netherlands",
        "Status": "Operating",
        "Capacity": 752,
        "CapacityUnit": "MW",
        "OwnershipPercentage": 100.0,
        "AssetType": "Offshore Wind Power"
      }
    ]
  }
];

// Recursive function to search for entities within the entire hierarchy
function findInHierarchy(entities: CorporateEntity[], predicate: (entity: CorporateEntity) => boolean): CorporateEntity[] {
    let results: CorporateEntity[] = [];
    for (const entity of entities) {
        if (predicate(entity)) {
            results.push(entity);
        }
        if (entity.Subsidiaries && entity.Subsidiaries.length > 0) {
            results = results.concat(findInHierarchy(entity.Subsidiaries, predicate));
        }
    }
    return results;
}

// Recursive function to gather all assets from an entity and its subsidiaries
function gatherAllAssets(entity: CorporateEntity): Asset[] {
    let assets = [...(entity.Assets || [])];
    if (entity.Subsidiaries && entity.Subsidiaries.length > 0) {
        for (const sub of entity.Subsidiaries) {
            assets = assets.concat(gatherAllAssets(sub));
        }
    }
    return assets;
}

/**
 * Finds entities by name, supporting partial matches.
 * @param name - The name to search for.
 * @returns An array of matching corporate entities.
 */
export const findEntitiesByName = (name: string): CorporateEntity[] => {
    const lowerCaseName = name.toLowerCase();
    return findInHierarchy(db, entity => entity.EntityName.toLowerCase().includes(lowerCaseName));
};

/**
 * Finds a single entity by its exact ID.
 * @param entityId - The ID of the entity.
 * @returns The corporate entity or null if not found.
 */
export const findEntityById = (entityId: string): CorporateEntity | null => {
    const result = findInHierarchy(db, entity => entity.EntityID === entityId);
    return result.length > 0 ? result[0] : null;
};

/**
 * Gets all assets of a specific type and within a specific region (country).
 * This function searches across all entities in the database.
 * @param assetType - The type of asset (e.g., 'Bioenergy Power').
 * @param region - The country to filter by (e.g., 'Sweden').
 * @returns An array of matching assets, enriched with owner information.
 */
export const getAssets = (assetType: string, region: string): (Asset & { OwnerEntityName: string, OwnerEntityID: string })[] => {
    const lowerCaseRegion = region.toLowerCase();
    const lowerCaseAssetType = assetType.toLowerCase();
    const scandinavianCountries = ['sweden', 'norway', 'finland', 'denmark'];
    
    let allMatchingAssets: (Asset & { OwnerEntityName: string, OwnerEntityID: string })[] = [];

    const searchInEntities = (entities: CorporateEntity[]) => {
        for (const entity of entities) {
            const entityAssets = entity.Assets || [];
            entityAssets.forEach(asset => {
                const assetCountryLower = asset.Country.toLowerCase();
                const regionMatch = lowerCaseRegion === 'scandinavia' 
                    ? scandinavianCountries.includes(assetCountryLower)
                    : assetCountryLower.includes(lowerCaseRegion);

                if (regionMatch && asset.AssetType.toLowerCase().includes(lowerCaseAssetType)) {
                    allMatchingAssets.push({
                        ...asset,
                        OwnerEntityName: entity.EntityName,
                        OwnerEntityID: entity.EntityID
                    });
                }
            });

            if (entity.Subsidiaries && entity.Subsidiaries.length > 0) {
                searchInEntities(entity.Subsidiaries);
            }
        }
    };
    
    searchInEntities(db);
    return allMatchingAssets;
};


/**
 * Retrieves parent company information for a given entity ID.
 * @param entityId - The ID of the subsidiary.
 * @returns The parent entity or null if it's a top-level company or not found.
 */
export const getParentCompany = (entityId: string): CorporateEntity | null => {
    const findParent = (entities: CorporateEntity[], id: string): CorporateEntity | null => {
        for (const entity of entities) {
            if (entity.Subsidiaries && entity.Subsidiaries.some(sub => sub.EntityID === id)) {
                return entity;
            }
            if (entity.Subsidiaries && entity.Subsidiaries.length > 0) {
                const parent = findParent(entity.Subsidiaries, id);
                if (parent) return parent;
            }
        }
        return null;
    };
    
    return findParent(db, entityId);
};