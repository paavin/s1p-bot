import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import config from "../config/config.json";

export const buildButtonRows = (guild: any, roleIds: string[]) => {
  const roles = roleIds
    .map(id => guild.roles.cache.get(id))
    .filter(Boolean);

  const buttons = roles
    .map(role => new ButtonBuilder()
      .setCustomId(`${config.buttonPrefix}${role.id}`)
      .setLabel(role.name)
      .setStyle(ButtonStyle.Secondary));

  const rows: ActionRowBuilder[] = [];
  for (let i = 0; i < buttons.length; i += 5) {
    rows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)));
  }

  return rows;
}

