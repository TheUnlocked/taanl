<template>
    <img class="emote" :src="src" :alt="name" :title="name" />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import RichText from '@/types/RichText';

@Component({
    
})
export default class EmoteRender extends Vue {
    @Prop({type: String})
    src!: string;
    @Prop({type: String})
    name!: string;
}
</script>

<style lang="scss">
.emote {
    width: 36px;
    height: 36px;
}
</style>