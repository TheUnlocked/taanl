<template>
    <div class="emote" :style="`background-image:url(${src})`"></div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import RichText from '@/types/RichText';

@Component({
    
})
export default class EmoteRender extends Vue {
    @Prop({type: String})
    src!: string;
}
</script>

<style lang="scss">
.emote {
    width: 36px;
    height: 36px;
    vertical-align: baseline;
    background-size: contain;
    background-repeat: no-repeat;
}
</style>