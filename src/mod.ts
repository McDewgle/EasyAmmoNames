import { DependencyContainer } from "tsyringe";

import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt/servers/DatabaseServer";

class EasyAmmoNames implements IPostDBLoadMod
{
    private modConfig = require("../config/config.json");

    postDBLoad(container: DependencyContainer): void
    {
        const logger = container.resolve<ILogger>("WinstonLogger");
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        const itemDatabase = databaseServer.getTables().templates.items;
        const localeDatabase = databaseServer.getTables().locales.global[this.modConfig["locale"]];

        for (const itemTpl in this.modConfig["items"])
        {
            const itemInfo = this.modConfig["items"][itemTpl];
            
            if (itemTpl in itemDatabase)
            {
                const itemName = itemTpl + " Name";
                const itemShortName = itemTpl + " ShortName";
                const itemDescription = itemTpl + " Description";

                if (itemInfo["Name"] != "" && itemName in localeDatabase)
                {
                    localeDatabase[itemName] = itemInfo["Name"];
                }

                if (itemInfo["ShortName"] != "" && itemShortName in localeDatabase)
                {
                    if (itemInfo["ShortName"].length > 9)
                    {
                        logger.error("Provided shortname was too long! Shortnames have a maximum of 9 characters.");
                        logger.error(`Trimming ${itemInfo["ShortName"]} to ${itemInfo["ShortName"].substring(0, 9)}`);
                        itemInfo["ShortName"] = itemInfo["ShortName"].substring(0, 9);
                    }
                    
                    localeDatabase[itemShortName] = itemInfo["ShortName"];
                }

                if (itemInfo["Description"] != "" && itemDescription in localeDatabase)
                {
                    localeDatabase[itemDescription] = itemInfo["Description"];
                }
            }
        }
    }
}

module.exports = { mod: new EasyAmmoNames() };
