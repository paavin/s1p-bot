import { Client, GatewayIntentBits, MessageFlags, PermissionsBitField, ChannelType } from "discord.js";
import config from "./config/config.json";
import { buildButtonRows } from './features/buttons.ts'

const tempChannels = new Map();
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates]
});

client.once('clientReady', async () => {
  try {
    console.log(`🤖 Logged in as ${client?.user?.tag}`);

    const channel: any = await client.channels.fetch(config.roleChannelId);
    if (!channel || !channel.isTextBased()) return;

    const guild = channel.guild;
    await guild.roles.fetch();

    console.log(`Create buttons...`)

    await channel.send({
      content: "🎭 Klick auf die Buttons, um deine Rollen zu wählen:",
      components: buildButtonRows(guild, config.topics),
    });

    await channel.send({
      content: "🎭 Klick auf die Buttons, um deine Rollen zu wählen:",
      components: buildButtonRows(guild, config.programmingIds),
    });

    await channel.send({
      content: "🎭 Klick auf die Buttons, um deine Rollen zu wählen:",
      components: buildButtonRows(guild, config.gamesIds),
    });

    await channel.send({
      content: "🎭 Klick auf die Buttons, um deine Rollen zu wählen:",
      components: buildButtonRows(guild, config.consoleIds),
    });

    console.log(`Created buttons!`)
  } catch (e) {
    console.error({ e })
  }
});

client.on("interactionCreate", async (interaction: any) => {
  if (interaction.isButton() && interaction.customId.startsWith(config.buttonPrefix)) {
    const roleId: any = interaction.customId.slice(config.buttonPrefix.length);
    const member: any = interaction.member;

    const has: boolean = member.roles.cache.has(roleId);
    if (has) await member.roles.remove(roleId);
    else await member.roles.add(roleId);

    await interaction.reply({
      content: has ? "❌ Rolle entfernt" : "✅ Rolle hinzugefügt",
      flags: MessageFlags.Ephemeral
    });
  }
})

client.on("voiceStateUpdate", async (oldState: any, newState: any) => {
  if (config.voiceChannels.includes(newState.channelId)) {
    const guild: any = newState.guild;
    const member: any = newState.member;
    const trigger: any = guild.channels.cache.get(newState.channelId);

    const vc = await guild.channels.create({
      name: `🎧 ${member.user.username}`,
      type: ChannelType.GuildVoice,
      parent: trigger.parentId ?? null,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          allow: [PermissionsBitField.Flags.Connect],
        },
        {
          id: member.id,
          allow: [
            PermissionsBitField.Flags.ManageChannels,
            PermissionsBitField.Flags.MoveMembers,
            PermissionsBitField.Flags.MuteMembers,
            PermissionsBitField.Flags.DeafenMembers,
          ],
        },
      ],
    });

    tempChannels.set(vc.id, member.id);
    await member.voice.setChannel(vc);
    return;
  }

  const leftChannel = oldState.channel;
  if (leftChannel && tempChannels.has(leftChannel.id)) {
    if (leftChannel.members.size === 0) {
      tempChannels.delete(leftChannel.id);
      await leftChannel.delete().catch(() => { });
    }
  }
})

client.login(config.token);
