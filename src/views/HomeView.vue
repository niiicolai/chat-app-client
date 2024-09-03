<script setup lang="ts">
import Content from '@/components/Content.vue';
import { useRoom } from '@/composables/useRoom.js'
import { useChannel } from '@/composables/useChannel.js'
import { useToast } from '@/composables/useToast.js'
import { ref, onMounted } from 'vue'

const toastCtrl = useToast()
const roomCtrl = useRoom()
const channelCtrl = useChannel()

const API_URL = import.meta.env.VITE_API_URL

const rooms = ref([])
const roles = ref([])
const categories = ref([])
const currentRoom = ref(null)
const currentInviteLinks = ref([]);
const currentChannels = ref([])

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
    <div v-if="!editRoom">
      <h1 class="text-xl font-bold">
        New Room
      </h1>
      <div>
        <input v-model="name" placeholder="Name" class="p-2 m-2 border border-gray-300" />
        <input v-model="description" placeholder="Description" class="p-2 m-2 border border-gray-300" />
        <button @click="createRoom()" class="p-2 m-2 bg-blue-500 text-white">
          Create
        </button>
      </div>
    </div>
    <div v-else>
      <h1 class="text-xl font-bold">
        Edit Room
      </h1>
      <div>
        <input v-model="editName" :placeholder="editRoom.name" class="p-2 m-2 border border-gray-300" />
        <input v-model="editDescription" :placeholder="editRoom.description" class="p-2 m-2 border border-gray-300" />
        <button @click="updateRoom()" class="p-2 m-2 bg-blue-500 text-white">
          Update
        </button>

        <button @click="editRoom = null" class="p-2 m-2 bg-blue-500 text-white">
          Cancel
        </button>
      </div>
    </div>



    <h1 class="text-xl font-bold">
      Rooms
    </h1>

    <ul>
      <li v-for="room in rooms" :key="room.uuid">
        {{ room.name }} -
        <button @click="deleteRoom(room)" class="p-2 m-2 bg-blue-500 text-white">
          Delete
        </button>

        <button @click="showRoom(room)" class="p-2 m-2 bg-blue-500 text-white">
          Show
        </button>

        <button @click="startEditRoom(room)" class="p-2 m-2 bg-blue-500 text-white">
          Edit
        </button>


      </li>
    </ul>

    <div>
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
        <ul>
          <li v-for="inviteLink in currentInviteLinks" :key="inviteLink.uuid">
            <a :href="`/join_room/${inviteLink.uuid}`" target="_blank" class="p-2 m-2 bg-blue-500 text-white block">
              {{ `/join_room/${inviteLink.uuid}` }}<br />
              Expires At: {{ inviteLink.expires_at }}
            </a>
            <button @click="copyLink(inviteLink)" class="p-2 m-2 bg-blue-500 text-white">
              Copy
            </button>
            <button @click="startEditLink(inviteLink)" class="p-2 m-2 bg-blue-500 text-white">
              Edit
            </button>
            <button @click="deleteLink(inviteLink)" class="p-2 m-2 bg-blue-500 text-white">
              Delete
            </button>
          </li>
        </ul>

        <h2 class="text-xl font-bold">
          Channels
        </h2>
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
        <ul>
          <li v-for="channel in currentChannels" :key="channel.uuid">
            {{ channel.name }} -
            <button @click="deleteChannel(channel)" class="p-2 m-2 bg-blue-500 text-white">
              Delete
            </button>
            <button @click="startEditChannel(channel)" class="p-2 m-2 bg-blue-500 text-white">
              Edit
            </button>
          </li>
        </ul>
      </div>


    </div>
  </Content>
</template>
