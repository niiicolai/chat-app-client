<script setup lang="ts">
import Content from '@/components/Content.vue';
import Rooms from '@/components/Rooms.vue';
import Channels from '@/components/Channels.vue';
import Members from '@/components/Members.vue';
import Links from '@/components/Links.vue';
import { useRoom } from '@/composables/useRoom.js'
import { useChannel } from '@/composables/useChannel.js'
import { useToast } from '@/composables/useToast.js'
import { useUser } from '@/composables/useUser.js'
import { ref, computed, onMounted } from 'vue'
import { useRoomSelector } from '@/composables/useRoomSelector.js'

const toastCtrl = useToast()
const roomCtrl = useRoom()
const channelCtrl = useChannel()
const userCtrl = useUser()
const roomSelector = useRoomSelector()
const room = computed(() => roomSelector.room.value)

const rooms = ref([])
const roles = ref([])
const categories = ref([])
const currentRoom = ref(null)
const currentInviteLinks = ref([]);
const currentChannels = ref([])
const currentChannel = ref(null)
const currentChannelMessages = ref([])
const currentUserRooms = ref(null)
const currentUserRoom = ref(null)

const sub = userCtrl.getSub()

const channelTypes = ref([]);
const uploadTypes = ref([]);
const showRoom = async (room) => {
  currentRoom.value = await roomCtrl.findOne(room.uuid)

  const { data: roomInviteLinksData } = await roomCtrl
    .inviteLinks
    .findAll({ page: 1, limit: 10, room_uuid: room.uuid })

  currentInviteLinks.value = roomInviteLinksData

  const { data: roomChannelsData } = await channelCtrl
    .findAll({ page: 1, limit: 10, room_uuid: room.uuid })

  currentChannels.value = roomChannelsData
  if (roomChannelsData.length > 0)
    showChannel(roomChannelsData[0])
  else {
    currentChannel.value = null
    currentChannelMessages.value = []
  }

  const { data: userRoomsData } = await roomCtrl.userRooms.findAll({ room_uuid: room.uuid })
  currentUserRooms.value = userRoomsData
  currentUserRoom.value = userRoomsData.find(userRoom => userRoom.user_uuid === sub)
}

const leaveRoom = async () => {
  const uuid = currentUserRoom.value ? currentUserRoom.value.uuid : null
  if (!uuid) {
    toastCtrl.add('You are not in this room', 'error')
    return
  }

  try {
    await roomCtrl.userRooms.delete(uuid)
  } catch (error) {
    toastCtrl.add(error.message, 'error')
    return
  }

  currentRoom.value = null
  currentInviteLinks.value = []
  currentChannels.value = []
  currentChannel.value = null
  currentChannelMessages.value = []
  currentUserRooms.value = null
  currentUserRoom.value = null

  const { data } = await roomCtrl.findAll()
  rooms.value = data
}

const isAdmin = () => {
  if (!currentUserRoom.value) return false
  return currentUserRoom.value.room_role_name === 'Admin'
}

const showChannel = async (channel) => {
  currentChannel.value = await channelCtrl.findOne(channel.uuid)
  const { data: channelMessagesData } = await channelCtrl.messages.findAll({
    page: 1, limit: 10, channel_uuid: channel.uuid
  })
  currentChannelMessages.value = channelMessagesData
}

const channelMessage = ref('')
const createChannelMessage = async (message) => {
  if (!currentChannel.value) {
    toastCtrl.add('Select a channel', 'error')
    return
  }
  if (!channelMessage.value) {
    toastCtrl.add('Message is required', 'error')
    return
  }

  try {
    const body = channelMessage.value
    await channelCtrl.messages.create({ body, channel_uuid: currentChannel.value.uuid })
  } catch (error) {
    toastCtrl.add(error.message, 'error')
    return
  }
  const { data: channelMessagesData } = await channelCtrl.messages.findAll({
    page: 1, limit: 10, channel_uuid: currentChannel.value.uuid
  })
  currentChannelMessages.value = channelMessagesData
  channelMessage.value = ''
}

const editChannelMessageBody = ref('')
const editChannelMessage = ref(null)
const startEditChannelMessage = (message) => {
  editChannelMessage.value = message
  editChannelMessageBody.value = message.body
}
const updateChannelMessage = async () => {
  if (!editChannelMessageBody.value) {
    toastCtrl.add('Message is required', 'error')
    return
  }

  try {
    await channelCtrl.messages.update(editChannelMessage.value.uuid, { body: editChannelMessageBody.value })
  } catch (error) {
    toastCtrl.add(error.message, 'error')
    return
  }
  const { data: channelMessagesData } = await channelCtrl.messages.findAll({
    page: 1, limit: 10, channel_uuid: currentChannel.value.uuid
  })
  currentChannelMessages.value = channelMessagesData
  editChannelMessageBody.value = ''
  editChannelMessage.value = null
}

const deleteChannelMessage = async (message) => {
  try {
    await channelCtrl.messages.delete(message.uuid)
  } catch (error) {
    toastCtrl.add(error.message, 'error')
    return
  }
  const { data: channelMessagesData } = await channelCtrl.messages.findAll({
    page: 1, limit: 10, channel_uuid: currentChannel.value.uuid
  })
  currentChannelMessages.value = channelMessagesData
}

const name = ref('')
const description = ref('')
const createRoom = async () => {
  if (!name.value) {
    toastCtrl.add('Name is required', 'error')
    return
  }
  if (!description.value) {
    toastCtrl.add('Description is required', 'error')
    return
  }

  try {
    await roomCtrl.create({ name: name.value, description: description.value, room_category_name: 'General' })
  } catch (error) {
    toastCtrl.add(error.message, 'error')
    return
  }
  const { data } = await roomCtrl.findAll()
  rooms.value = data
  name.value = ''
  description.value = ''

  toastCtrl.add('Room created', 'success')
}

const editName = ref('')
const editDescription = ref('')
const editRoom = ref(null)
const startEditRoom = (room) => {
  editRoom.value = room
  editName.value = room.name
  editDescription.value = room.description
}
const updateRoom = async () => {
  if (!editName.value) {
    toastCtrl.add('Name is required', 'error')
    return
  }
  if (!editDescription.value) {
    toastCtrl.add('Description is required', 'error')
    return
  }

  try {
    await roomCtrl.update(editRoom.value.uuid, { name: editName.value, description: editDescription.value })
  } catch (error) {
    toastCtrl.add(error.message, 'error')
    return
  }
  const { data } = await roomCtrl.findAll()
  rooms.value = data
  editName.value = ''
  editDescription.value = ''
  editRoom.value = null

  toastCtrl.add('Room updated', 'success')
}

const deleteRoom = async (room) => {
  try {
    await roomCtrl.delete(room.uuid)
  } catch (error) {
    toastCtrl.add(error.message, 'error')
    return
  }
  const { data } = await roomCtrl.findAll()
  rooms.value = data

  toastCtrl.add('Room deleted', 'success')
}

const linkExpiresAt = ref('')
const createLink = async () => {
  if (!currentRoom.value) {
    toastCtrl.add('Select a room', 'error')
    return
  }
  if (!linkExpiresAt.value) {
    toastCtrl.add('Expires at is required', 'error')
    return
  }
  const room_uuid = currentRoom.value.uuid
  const expires_at = linkExpiresAt.value
  try {
    await roomCtrl.inviteLinks.create({ room_uuid, expires_at })
  } catch (error) {
    toastCtrl.add(error.message, 'error')
    return
  }
  const { data: roomInviteLinksData } = await roomCtrl
    .inviteLinks
    .findAll({ page: 1, limit: 10, room_uuid })

  currentInviteLinks.value = roomInviteLinksData
}

const editLinkExpiresAt = ref('')
const editLink = ref(null)
const startEditLink = (link) => {
  editLink.value = link
  editLinkExpiresAt.value = link.expires_at
}
const updateLink = async () => {
  if (!editLinkExpiresAt.value) {
    toastCtrl.add('Expires at is required', 'error')
    return
  }

  try {
    await roomCtrl.inviteLinks.update(editLink.value.uuid, { expires_at: editLinkExpiresAt.value })
  } catch (error) {
    toastCtrl.add(error.message, 'error')
    return
  }
  const { data: roomInviteLinksData } = await roomCtrl
    .inviteLinks
    .findAll({ page: 1, limit: 10, room_uuid: currentRoom.value.uuid })

  currentInviteLinks.value = roomInviteLinksData
  editLinkExpiresAt.value = ''
  editLink.value = null
}

const deleteLink = async (link) => {
  try {
    await roomCtrl.inviteLinks.delete(link.uuid)
  } catch (error) {
    toastCtrl.add(error.message, 'error')
    return
  }
  const { data: roomInviteLinksData } = await roomCtrl
    .inviteLinks
    .findAll({ page: 1, limit: 10, room_uuid: currentRoom.value.uuid })

  currentInviteLinks.value = roomInviteLinksData
}

const copyLink = (link) => {
  const origin = window.location.origin
  const url = `${origin}/join_room/${link.uuid}`

  navigator.clipboard.writeText(url)
  toastCtrl.add('Link copied', 'success')
}

const channelName = ref('')
const channelDescription = ref('')
const channelType = ref('')

const createChannel = async () => {
  if (!channelName.value) {
    toastCtrl.add('Name is required', 'error')
    return
  }
  if (!channelDescription.value) {
    toastCtrl.add('Description is required', 'error')
    return
  }
  if (!channelType.value) {
    toastCtrl.add('Type is required', 'error')
    return
  }
  if (!currentRoom.value) {
    toastCtrl.add('Select a room', 'error')
    return
  }

  try {
    await channelCtrl.create({
      name: channelName.value,
      description: channelDescription.value,
      channel_type_name: channelType.value,
      room_uuid: currentRoom.value.uuid
    })
  } catch (error) {
    toastCtrl.add(error.message, 'error')
    return
  }
  const { data: roomChannelsData } = await channelCtrl
    .findAll({ page: 1, limit: 10, room_uuid: currentRoom.value.uuid })

  currentChannels.value = roomChannelsData
  channelName.value = ''
  channelDescription.value = ''
  channelType.value = ''

  toastCtrl.add('Channel created', 'success')
}
const editChannelName = ref('')
const editChannelDescription = ref('')
const editChannelType = ref('')
const editChannel = ref(null)
const startEditChannel = (channel) => {
  editChannel.value = channel
  editChannelName.value = channel.name
  editChannelDescription.value = channel.description
  editChannelType.value = channel.channel_type_name
}
const updateChannel = async () => {
  if (!editChannelName.value) {
    toastCtrl.add('Name is required', 'error')
    return
  }
  if (!editChannelDescription.value) {
    toastCtrl.add('Description is required', 'error')
    return
  }
  if (!editChannelType.value) {
    toastCtrl.add('Type is required', 'error')
    return
  }
  if (!currentRoom.value) {
    toastCtrl.add('Select a room', 'error')
    return
  }

  try {
    await channelCtrl.update(editChannel.value.uuid, {
      name: editChannelName.value,
      description: editChannelDescription.value,
      channel_type_name: editChannelType.value,
      room_uuid: currentRoom.value.uuid
    })
  } catch (error) {
    toastCtrl.add(error.message, 'error')
    return
  }
  const { data: roomChannelsData } = await channelCtrl
    .findAll({ page: 1, limit: 10, room_uuid: currentRoom.value.uuid })

  currentChannels.value = roomChannelsData
  editChannelName.value = ''
  editChannelDescription.value = ''
  editChannelType.value = ''
  editChannel.value = null

  toastCtrl.add('Channel updated', 'success')
}

const deleteChannel = async (channel) => {
  try {
    await channelCtrl.delete(channel.uuid)
  } catch (error) {
    toastCtrl.add(error.message, 'error')
    return
  }
  const { data: roomChannelsData } = await channelCtrl
    .findAll({ page: 1, limit: 10, room_uuid: currentRoom.value.uuid })

  currentChannels.value = roomChannelsData

  toastCtrl.add('Channel deleted', 'success')
}
onMounted(async () => {
  const { data } = await roomCtrl.findAll()
  rooms.value = data

  const { data: rolesData } = await roomCtrl.roles.findAll()
  roles.value = rolesData

  const { data: categoriesData } = await roomCtrl.categories.findAll()
  categories.value = categoriesData

  const { data: channelTypesData } = await channelCtrl.types.findAll()
  channelTypes.value = channelTypesData

  const { data: uploadTypesData } = await channelCtrl.uploadTypes.findAll()
  uploadTypes.value = uploadTypesData
})
</script>

<template>
  <Content>

    <Rooms />
    <div style="padding-left: 8.5em; padding-top: 1em;">
      <Channels v-if="room" />
      <Members v-if="room" />
      <Links v-if="room" />
    </div>

    <div class="hidden">
      <h2 class="text-xl font-bold">
        Current Room
      </h2>
      <div v-if="currentRoom">
        <p>
          Name: {{ currentRoom.name }}
        </p>
        <p>
          Description: {{ currentRoom.description }}
        </p>

        <h2 class="text-xl font-bold">
          Invite Links
        </h2>
        <div v-if="isAdmin()">
          <div v-if="!editLink">
            <input v-model="linkExpiresAt" placeholder="Expires At" class="p-2 m-2 border border-gray-300"
              type="datetime-local" />

            <button @click="createLink()" class="p-2 m-2 bg-blue-500 text-white">
              Create Link
            </button>
          </div>
          <div v-else>
            <input v-model="editLinkExpiresAt" :placeholder="editLink.expires_at" class="p-2 m-2 border border-gray-300"
              type="datetime-local" />
            <button @click="updateLink()" class="p-2 m-2 bg-blue-500 text-white">
              Update Link
            </button>

            <button @click="editLink = null" class="p-2 m-2 bg-blue-500 text-white">
              Cancel
            </button>
          </div>
        </div>
        <ul>
          <li v-for="inviteLink in currentInviteLinks" :key="inviteLink.uuid">
            <a :href="`/join_room/${inviteLink.uuid}`" target="_blank" class="p-2 m-2 bg-blue-500 text-white block">
              {{ `/join_room/${inviteLink.uuid}` }}<br />
              Expires At: {{ inviteLink.expires_at }}
            </a>
            <button @click="copyLink(inviteLink)" class="p-2 m-2 bg-blue-500 text-white">
              Copy
            </button>
            <button @click="startEditLink(inviteLink)" v-if="isAdmin()" class="p-2 m-2 bg-blue-500 text-white">
              Edit
            </button>
            <button @click="deleteLink(inviteLink)" v-if="isAdmin()" class="p-2 m-2 bg-blue-500 text-white">
              Delete
            </button>
          </li>
        </ul>
        <div v-if="currentInviteLinks.length === 0">
          No links
        </div>

        <h2 class="text-xl font-bold">
          Members
        </h2>
        <ul>
          <li v-for="userRoom in currentUserRooms" :key="userRoom.uuid">
            {{ userRoom.user_uuid }} - {{ userRoom.room_role_name }}
            <div v-if="userRoom.user_uuid === sub">
              YOU
            </div>
          </li>
        </ul>
        <button @click="leaveRoom()" class="p-2 m-2 bg-blue-500 text-white">
          Leave Room
        </button>

        <h2 class="text-xl font-bold">
          Channels
        </h2>
        <div v-if="isAdmin()">
          <div v-if="!editChannel">
            <input v-model="channelName" placeholder="Name" class="p-2 m-2 border border-gray-300" />
            <input v-model="channelDescription" placeholder="Description" class="p-2 m-2 border border-gray-300" />
            <select v-model="channelType" class="p-2 m-2 border border-gray-300">
              <option v-for="channelType in channelTypes" :key="channelType.name" :value="channelType.name">
                {{ channelType.name }}
              </option>
            </select>
            <button @click="createChannel()" class="p-2 m-2 bg-blue-500 text-white">
              Create Channel
            </button>
          </div>
          <div v-else>
            <input v-model="editChannelName" :placeholder="editChannel.name" class="p-2 m-2 border border-gray-300" />
            <input v-model="editChannelDescription" :placeholder="editChannel.description"
              class="p-2 m-2 border border-gray-300" />
            <select v-model="editChannelType" class="text-black p-2 m-2 border border-gray-300">
              <option v-for="channelType in channelTypes" :key="channelType.name" :value="channelType.name">
                {{ channelType.name }}
              </option>
            </select>
            <button @click="updateChannel()" class="p-2 m-2 bg-blue-500 text-white">
              Update Channel
            </button>
            <button @click="editChannel = null" class="p-2 m-2 bg-blue-500 text-white">
              Cancel
            </button>
          </div>
        </div>
        <ul>
          <li v-for="channel in currentChannels" :key="channel.uuid">
            {{ channel.name }} -
            <button @click="deleteChannel(channel)" v-if="isAdmin()" class="p-2 m-2 bg-blue-500 text-white">
              Delete
            </button>
            <button @click="startEditChannel(channel)" v-if="isAdmin()" class="p-2 m-2 bg-blue-500 text-white">
              Edit
            </button>
            <button @click="showChannel(channel)" class="p-2 m-2 bg-blue-500 text-white">
              Show
            </button>
          </li>
        </ul>
        <div v-if="currentChannels.length === 0">
          No channels
        </div>

        <div v-if="currentChannel">
          <h2 class="text-xl font-bold">
            Current Channel
          </h2>
          <p>
            Name: {{ currentChannel.name }}
          </p>
          <p>
            Description: {{ currentChannel.description }}
          </p>
          <h2 class="text-xl font-bold">
            Messages
          </h2>
          <div v-if="!editChannelMessage">
            <input v-model="channelMessage" placeholder="Message" class="p-2 m-2 border border-gray-300" />
            <button @click="createChannelMessage()" class="p-2 m-2 bg-blue-500 text-white">
              Send
            </button>
          </div>
          <div v-else>
            <input v-model="editChannelMessageBody" :placeholder="editChannelMessage.body"
              class="p-2 m-2 border border-gray-300" />
            <button @click="updateChannelMessage()" class="p-2 m-2 bg-blue-500 text-white">
              Update
            </button>
            <button @click="editChannelMessage = null" class="p-2 m-2 bg-blue-500 text-white">
              Cancel
            </button>
          </div>
          <ul>
            <li v-for="message in currentChannelMessages" :key="message.uuid">
              {{ message.body }} - {{ message.user_uuid === sub ? 'You' : 'Other' }}
              <div v-if="message.user_uuid === sub">
                <button @click="startEditChannelMessage(message)" class="p-2 m-2 bg-blue-500 text-white">
                  Edit
                </button>
                <button @click="deleteChannelMessage(message)" class="p-2 m-2 bg-blue-500 text-white">
                  Delete
                </button>
              </div>
            </li>
          </ul>
          <div v-if="currentChannelMessages.length === 0">
            No messages
          </div>
        </div>
      </div>


    </div>
  </Content>
</template>
